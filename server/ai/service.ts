import { randomUUID } from "node:crypto";
import type { Decision } from "@shared/proofloan";
import type { AiBatchResult, AiDecisionEnvelope, AiRequest, AiModelProfile, AiProviderStatus } from "./aiTypes";
import { AI_DEFAULT_MODEL_ID, AI_FEATURE_VERSION, AI_MAX_BATCH, AI_MAX_REQUEST_ID_LENGTH, AI_MIN_CONFIDENCE_TO_ACT, AI_MODEL_VERSION, AI_POLICY_HASH } from "./constants";
import { requestFingerprint, outputFingerprint, shortHash } from "./fingerprint";
import { assertValidAiRequest } from "./guards";
import { baselineScore } from "./baseline";
import { estimateUncertainty } from "./uncertainty";
import { evidenceLinks, reasonFromCode } from "./explain";
import { DEFAULT_AI_ACTION_POLICY, evaluateAiPolicy } from "./policy";
import { AiProvider } from "./provider";
import { sanitizeCandidate, applyRiskTier } from "./normalize";
import { calibrateDecision } from "./calibration";
import { deriveAdvancedFeatures } from "./features";
import { AiAuditJournal } from "./audit";
import { AiDecisionCache } from "./cache";
import { validateEnvelope } from "./guards2";
import { AiError, normalizeAiError } from "./errors";
import { buildAiBlockchainContext } from "./blockchain/context";

export const DEFAULT_MODEL_PROFILE: AiModelProfile = { id: AI_DEFAULT_MODEL_ID, version: AI_MODEL_VERSION, provider: "forge", status: "available", maxPd30: .95, maxPd90: .99, minConfidence: AI_MIN_CONFIDENCE_TO_ACT, temperature: .1, timeoutMs: 8000, featureVersion: AI_FEATURE_VERSION, policyHash: AI_POLICY_HASH };

function sanitizeRequestId(requestId: string | undefined): string {
  const trimmed = typeof requestId === "string" ? requestId.trim() : "";
  if (trimmed.length >= 4 && trimmed.length <= AI_MAX_REQUEST_ID_LENGTH) return trimmed;
  return `air_${randomUUID().replaceAll("-", "")}`;
}

export class AiUnderwritingService {
  readonly audit = new AiAuditJournal();
  readonly cache = new AiDecisionCache();
  private profile: AiModelProfile = DEFAULT_MODEL_PROFILE;
  private status: AiProviderStatus = "available";
  constructor(profile?: Partial<AiModelProfile>) { this.profile = { ...this.profile, ...profile }; }
  setStatus(status: AiProviderStatus): void { this.status = status; }
  getProfile(): AiModelProfile { return { ...this.profile, status: this.status }; }

  async decide(input: AiRequest): Promise<AiDecisionEnvelope> {
    const requestId = sanitizeRequestId(input?.requestId);
    const started = new Date().toISOString();
    try {
      assertValidAiRequest(input);
    } catch (error) {
      this.audit.append({ requestId, stage: "validate", type: "request.invalid", detail: error instanceof Error ? error.message : "invalid AI request" });
      throw normalizeAiError(error);
    }

    try {
    const facts = input.facts;
    const inputFingerprint = requestFingerprint({ walletAddress: input.walletAddress, features: input.features, facts: facts.map(f => ({ id: f.id, proofRoot: f.proofRoot, eventType: f.eventType, observedAt: f.observedAt })) });
    const cached = this.cache.get(inputFingerprint);
    if (cached) {
      const cacheErrors = validateEnvelope(cached);
      if (cacheErrors.length === 0) return { ...cached, requestId };
      this.cache.clear();
    }

    const stages: AiDecisionEnvelope["stages"] = [];
    const runStage = <T>(stage: AiDecisionEnvelope["stages"][number]["stage"], fn: () => T): T => {
      const s = new Date().toISOString();
      this.audit.append({ requestId, stage, type: "stage.started", detail: `${stage} started` });
      try {
        const v = fn();
        stages.push({ stage, startedAt: s, finishedAt: new Date().toISOString(), ok: true });
        return v;
      } catch (e) {
        stages.push({ stage, startedAt: s, finishedAt: new Date().toISOString(), ok: false, detail: e instanceof Error ? e.message : "stage failed" });
        throw e;
      }
    };

    runStage("validate", () => { assertValidAiRequest(input); return true; });
    const derived = runStage("normalize", () => deriveAdvancedFeatures(facts, input.nowMs));
    const blockchain = runStage("engineer", () => buildAiBlockchainContext(facts, input.nowMs, input.walletAddress));
    const base = runStage("engineer", () => baselineScore(input.features, facts));
    let decision: Decision = base;
    let providerUsed = "deterministic-baseline";
    if (this.status === "available") {
      try {
        const candidate = await new AiProvider(this.profile).infer(input.features, facts, blockchain.promptContext);
        decision = { ...base, ...applyRiskTier(sanitizeCandidate(candidate, base)) };
        decision = { ...calibrateDecision(decision), evidenceRoot: base.evidenceRoot, featureFingerprint: base.featureFingerprint, modelVersion: this.profile.version, featureVersion: this.profile.featureVersion, policyHash: this.profile.policyHash };
        decision.decisionHash = shortHash(decision, 24);
        providerUsed = this.profile.provider;
      } catch (error) {
        this.audit.append({ requestId, stage: "score", type: "provider.fallback", detail: "AI provider unavailable; deterministic baseline used", payload: error instanceof Error ? error.message : "unknown" });
      }
    }
    const uncertainty = runStage("score", () => estimateUncertainty(input.features, facts));
    const reasons = runStage("explain", () => decision.reasonCodes.map(code => reasonFromCode(code, input.features)));
    const links = runStage("explain", () => evidenceLinks(facts, input.features));
    const policy = runStage("policy", () => evaluateAiPolicy(decision, uncertainty, DEFAULT_AI_ACTION_POLICY));
    const shouldAbstain = input.mode !== "shadow" && (!policy.allowed || decision.confidence < this.profile.minConfidence || uncertainty.total > .55 || blockchain.score.abstain);
    const abstainReason = shouldAbstain
      ? (blockchain.score.abstain && blockchain.score.reasons.length ? `blockchain:${blockchain.score.reasons.join(",")}` : policy.reason)
      : undefined;
    const envelope: AiDecisionEnvelope = {
      decision,
      baselineDecision: base,
      uncertainty,
      reasons,
      evidenceLinks: links,
      stages,
      abstained: shouldAbstain,
      abstainReason,
      mode: input.mode ?? "advisory",
      provider: providerUsed,
      modelVersion: decision.modelVersion,
      featureVersion: decision.featureVersion,
      policyHash: decision.policyHash,
      requestId,
      inputFingerprint,
      outputFingerprint: outputFingerprint({ decision, uncertainty, reasons, links, abstained: shouldAbstain, derived, started, blockchainFingerprint: blockchain.fingerprint, blockchainScore: blockchain.score.score }),
    };
    const envelopeErrors = validateEnvelope(envelope);
    if (envelopeErrors.length) throw new AiError("SANITIZE", `AI envelope failed bounds checks: ${envelopeErrors.join("; ")}`);
    runStage("audit", () => this.audit.append({ requestId, stage: "audit", type: "decision.completed", detail: shouldAbstain ? "AI decision abstained under bounded policy" : "AI decision completed", payload: { fingerprint: envelope.outputFingerprint, blockchainFingerprint: blockchain.fingerprint, evidenceMode: blockchain.evidenceMode, blockchainRoute: blockchain.route } }));
    if (!shouldAbstain) this.cache.set(inputFingerprint, envelope);
    return envelope;
    } catch (error) {
      throw normalizeAiError(error);
    }
  }

  async batch(inputs: AiRequest[]): Promise<AiBatchResult> {
    if (!Array.isArray(inputs)) throw new AiError("BATCH", "AI batch input must be an array.");
    if (inputs.length > AI_MAX_BATCH) throw new AiError("BATCH", `AI batch exceeds configured bound of ${AI_MAX_BATCH}.`);
    const envelopes: AiDecisionEnvelope[] = [];
    const failures: NonNullable<AiBatchResult["failures"]> = [];
    for (const input of inputs) {
      try {
        envelopes.push(await this.decide(input));
      } catch (error) {
        const normalized = normalizeAiError(error);
        failures.push({ requestId: typeof input?.requestId === "string" ? input.requestId : "unknown", code: normalized.code, message: normalized.message });
      }
    }
    const n = envelopes.length || 1;
    return {
      envelopes,
      failures,
      aggregate: {
        count: envelopes.length,
        abstained: envelopes.filter(e => e.abstained).length,
        avgConfidence: envelopes.reduce((s, e) => s + e.decision.confidence, 0) / n,
        avgPd30: envelopes.reduce((s, e) => s + e.decision.pd30, 0) / n,
        avgPd90: envelopes.reduce((s, e) => s + e.decision.pd90, 0) / n,
      },
    };
  }
}
export const aiUnderwritingService = new AiUnderwritingService();

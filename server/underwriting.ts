import { createHash } from "node:crypto";
import { invokeLLM } from "./_core/llm";
import {
  type Decision,
  type FeatureVector,
  type Offer,
  type ReasonCode,
  isReasonCode,
  type SourceChain,
  type VerifiedFact,
} from "@shared/proofloan";
import { getSourceChainRecord } from "@shared/multichain";
import { aiUnderwritingService } from "./ai/service";
import { AiError, normalizeAiError } from "./ai/errors";
import { parseJsonObject } from "./ai/json";

const MODEL_VERSION = "proofloan-underwriter-v0.1.0";
const FEATURE_VERSION = "feature-vector-v0.1.0";
export const POLICY_HASH = "riskguard-policy-v0.1.0:amount-ltv-rate-freshness-confidence-liquidity";

export const hashValue = (value: unknown) =>
  createHash("sha256").update(JSON.stringify(value)).digest("hex").slice(0, 18);

export function buildVerifiedFacts(walletAddress: string, sourceChain: SourceChain): VerifiedFact[] {
  const template = getSourceChainRecord(sourceChain).preview;
  const now = new Date().toISOString();
  return [
    {
      id: `vf_${hashValue({ walletAddress, sourceChain, n: 1 })}`,
      chain: sourceChain,
      sourceBlock: template.sourceBlock,
      txHash: `${template.txPrefix}a91f...c42e`,
      eventType: "REPAYMENT",
      amount: "1,250 USDC",
      asset: "USDC",
      verificationBlock: template.verificationBlock,
      verifiedAt: now,
      observedAt: new Date(Date.now() - 3 * 86_400_000).toISOString(),
      freshness: "Fresh",
      proofRoot: `0xproof_${hashValue({ walletAddress, sourceChain, root: 1 })}`,
      proofWorker: "Attestcoin proof worker",
    },
    {
      id: `vf_${hashValue({ walletAddress, sourceChain, n: 2 })}`,
      chain: sourceChain,
      sourceBlock: template.sourceBlock - 317_663,
      txHash: `${template.txPrefix}4b07...8aa1`,
      eventType: "COLLATERAL_DEPOSIT",
      amount: "2,800 USDC",
      asset: "USDC",
      verificationBlock: template.verificationBlock + 5,
      verifiedAt: now,
      observedAt: new Date(Date.now() - 3 * 86_400_000).toISOString(),
      freshness: "Fresh",
      proofRoot: `0xproof_${hashValue({ walletAddress, sourceChain, root: 2 })}`,
      proofWorker: "Attestcoin proof worker",
    },
    {
      id: `vf_${hashValue({ walletAddress, sourceChain, n: 3 })}`,
      chain: sourceChain,
      sourceBlock: template.sourceBlock - 423_742,
      txHash: `${template.txPrefix}11f8...d912`,
      eventType: "REPAYMENT",
      amount: "850 USDC",
      asset: "USDC",
      verificationBlock: template.verificationBlock + 9,
      verifiedAt: now,
      observedAt: new Date(Date.now() - 90 * 86_400_000).toISOString(),
      freshness: "Aging",
      proofRoot: `0xproof_${hashValue({ walletAddress, sourceChain, root: 3 })}`,
      proofWorker: "Attestcoin proof worker",
    },
  ];
}

export function isFeatureVectorFiniteAndBounded(features: FeatureVector): boolean {
  const boundedCounts = [features.repaymentCount, features.latePayments, features.evidenceCount];
  const boundedRatios = [features.leverageRatio, features.freshnessScore];
  const boundedVolumes = [features.volume7d, features.volume30d, features.volume180d];
  return [...boundedCounts, ...boundedRatios, ...boundedVolumes, features.walletAgeDays].every(value => Number.isFinite(value) && value >= 0)
    && boundedCounts.every(value => Number.isInteger(value) && value <= 64)
    && features.walletAgeDays <= 10_000
    && boundedRatios.every(value => value <= 1_000_000)
    && boundedVolumes.every(value => value <= 1_000_000);
}

export function buildFeatureVector(facts: VerifiedFact[], nowMs = Date.now()): FeatureVector {
  const safeFacts = Array.isArray(facts) ? facts : [];
  const safeNowMs = Number.isFinite(nowMs) ? nowMs : Date.now();
  const ageDays = (fact: VerifiedFact) => {
    const observedMs = Date.parse(fact.observedAt);
    if (!Number.isFinite(observedMs)) return 0;
    return Math.max(0, (safeNowMs - observedMs) / 86_400_000);
  };
  const amountValue = (fact: VerifiedFact) => {
    const parsed = Number.parseFloat(String(fact.amount ?? "").replace(/[^0-9.]/g, ""));
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
  };
  const repaymentFacts = safeFacts.filter(f => f.eventType === "REPAYMENT");
  const latePayments = safeFacts.filter(f => f.eventType === "LATE_PAYMENT").length;
  const collateral = safeFacts.filter(f => f.eventType === "COLLATERAL_DEPOSIT").reduce((sum, fact) => sum + amountValue(fact), 0);
  const repaymentVolume = repaymentFacts.reduce((sum, fact) => sum + amountValue(fact), 0);
  const volumeInWindow = (days: number) => safeFacts.filter(f => ageDays(f) <= days).reduce((sum, fact) => sum + amountValue(fact), 0);
  const ages = safeFacts.map(f => ageDays(f)).filter(value => Number.isFinite(value));
  const walletAgeDays = ages.length ? Math.round(Math.max(...ages)) : 0;
  return {
    repaymentCount: repaymentFacts.length,
    latePayments,
    leverageRatio: Number(Math.min(repaymentVolume / Math.max(collateral, 1), 100).toFixed(2)),
    walletAgeDays,
    volume7d: volumeInWindow(7),
    volume30d: volumeInWindow(30),
    volume180d: volumeInWindow(180),
    evidenceCount: safeFacts.length,
    freshnessScore: safeFacts.length ? safeFacts.reduce((sum, fact) => sum + (fact.freshness === "Fresh" ? 1 : fact.freshness === "Aging" ? 0.8 : 0.3), 0) / safeFacts.length : 0,
  };
}

const FEATURE_VECTOR_KEYS: Array<keyof FeatureVector> = ["repaymentCount", "latePayments", "leverageRatio", "walletAgeDays", "volume7d", "volume30d", "volume180d", "evidenceCount", "freshnessScore"];

export function fingerprintFeatureVector(features: FeatureVector): string {
  return hashValue(Object.fromEntries(FEATURE_VECTOR_KEYS.map(key => [key, features[key]])));
}

export function isProbabilityOrderConsistent(pd30: number, pd90: number): boolean {
  return Number.isFinite(pd30) && Number.isFinite(pd90) && pd30 <= pd90;
}

export function riskTierForPd30(pd30: number): Decision["riskTier"] {
  return pd30 < 0.1 ? "A" : pd30 < 0.18 ? "B" : pd30 < 0.3 ? "C" : "D";
}

export function fingerprintDecision(decision: Decision): string {
  const { decisionHash: _decisionHash, ...canonicalDecision } = decision;
  return hashValue(canonicalDecision);
}

export function isFeatureVectorConsistentWithFacts(features: FeatureVector, facts: VerifiedFact[], nowMs = Date.now()): boolean {
  if (!isFeatureVectorFiniteAndBounded(features)) return false;
  const expected = buildFeatureVector(facts, nowMs);
  return fingerprintFeatureVector(expected) === fingerprintFeatureVector(features);
}

function deterministicDecision(features: FeatureVector, facts: VerifiedFact[]): Decision {
  const sparse = features.evidenceCount < 2;
  const pd30 = Math.min(0.42, Math.max(0.03, 0.12 + features.latePayments * 0.08 + features.leverageRatio * 0.08 - features.repaymentCount * 0.025));
  const pd90 = Math.min(0.58, pd30 + 0.08);
  const reasonCodes: ReasonCode[] = [];
  if (features.repaymentCount >= 2) reasonCodes.push("STRONG_REPAYMENT_HISTORY");
  if (features.latePayments > 0) reasonCodes.push("RECENT_LATE_PAYMENT");
  if (features.leverageRatio > 0.8) reasonCodes.push("HIGH_LEVERAGE");
  if (sparse) reasonCodes.push("SPARSE_EVIDENCE");
  if (reasonCodes.length === 0) reasonCodes.push("SPARSE_EVIDENCE");
  const riskTier = riskTierForPd30(pd30);
  const evidenceRoot = hashValue(facts.map(f => f.proofRoot));
  const decisionBase = { pd30, pd90, confidence: features.freshnessScore * Math.min(0.98, 0.68 + features.evidenceCount * 0.08), freshnessScore: features.freshnessScore, riskTier, reasonCodes, evidenceRoot, featureFingerprint: fingerprintFeatureVector(features) };
  const decision = {
    ...decisionBase,
    modelVersion: MODEL_VERSION,
    featureVersion: FEATURE_VERSION,
    policyHash: POLICY_HASH,
  } as Decision;
  return { ...decision, decisionHash: fingerprintDecision(decision) };
}

const clampProbability = (value: unknown, fallback: number) => {
  const numeric = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numeric) ? Math.min(1, Math.max(0, numeric)) : fallback;
};

export function sanitizeAiCandidate(candidate: Partial<Decision>, baseline: Decision): Decision {
  const pd30 = clampProbability(candidate.pd30, baseline.pd30);
  const pd90 = Math.max(pd30, clampProbability(candidate.pd90, baseline.pd90));
  const confidence = Math.min(baseline.freshnessScore, clampProbability(candidate.confidence, baseline.confidence));
  const reasonCodes = Array.isArray(candidate.reasonCodes) ? candidate.reasonCodes.filter((code): code is ReasonCode => typeof code === "string" && isReasonCode(code)) : [];
  return { ...baseline, pd30, pd90, confidence, riskTier: riskTierForPd30(pd30), reasonCodes: reasonCodes.length ? reasonCodes : baseline.reasonCodes, featureFingerprint: baseline.featureFingerprint };
}

export async function runAiUnderwriting(features: FeatureVector, facts: VerifiedFact[]): Promise<Decision> {
  if (!Array.isArray(facts) || !isFeatureVectorFiniteAndBounded(features)) {
    throw new AiError("VALIDATION", "Underwriting requires a finite bounded feature vector and a facts array.");
  }
  try {
    const advanced = await aiUnderwritingService.decide({
      requestId: `legacy_${hashValue({ features, facts })}`,
      walletAddress: "legacy",
      features,
      facts,
      mode: "advisory",
    });
    if (!isProbabilityOrderConsistent(advanced.decision.pd30, advanced.decision.pd90) || !Number.isFinite(advanced.decision.confidence)) {
      throw new AiError("SANITIZE", "Advanced AI output failed probability bounds checks.");
    }
    return advanced.decision;
  } catch (error) {
    const normalized = normalizeAiError(error);
    if (normalized.code === "VALIDATION") throw normalized;
  }
  const baseline = deterministicDecision(features, facts);
  if (!isProbabilityOrderConsistent(baseline.pd30, baseline.pd90)) {
    throw new AiError("SANITIZE", "Deterministic underwriting baseline failed probability bounds checks.");
  }
  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: "You are ProofLoan's underwriting explainer. Return only typed JSON. The AI is advisory; never change arithmetic or policy constraints." },
        { role: "user", content: JSON.stringify({ task: "calibrate_pd_and_reasons", features, allowedReasonCodes: ["STRONG_REPAYMENT_HISTORY", "RECENT_LATE_PAYMENT", "HIGH_LEVERAGE", "SPARSE_EVIDENCE"] }) },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "proofloan_underwriting",
          strict: true,
          schema: {
            type: "object",
            properties: {
              pd30: { type: "number" }, pd90: { type: "number" }, confidence: { type: "number" },
              reasonCodes: { type: "array", items: { type: "string", enum: ["STRONG_REPAYMENT_HISTORY", "RECENT_LATE_PAYMENT", "HIGH_LEVERAGE", "SPARSE_EVIDENCE"] } },
            }, required: ["pd30", "pd90", "confidence", "reasonCodes"], additionalProperties: false,
          },
        },
      },
    });
    const content = response.choices?.[0]?.message?.content;
    const parsed = typeof content === "string" ? parseJsonObject(content) as Partial<Decision> : {};
    const candidate = sanitizeAiCandidate(parsed, baseline);
    if (!isProbabilityOrderConsistent(candidate.pd30, candidate.pd90)) return baseline;
    return { ...candidate, decisionHash: fingerprintDecision(candidate) };
  } catch {
    return baseline;
  }
}

export function isOfferAcceptable(state: string, status: Offer["status"], expiresAt?: string, nowMs = Date.now(), offer?: Partial<Offer>, decision?: Pick<Decision, "riskTier">) {
  if (state !== "AwaitingAcceptance" || status !== "Ready") return false;
  if (offer) {
    const collateralValue = offer.collateralValue ?? 2800;
    if (!Number.isFinite(offer.amount) || (offer.amount ?? 0) <= 0 || !Number.isFinite(offer.apr) || !Number.isFinite(offer.ltv) || !Number.isFinite(collateralValue) || collateralValue <= 0 || offer.ltv !== ltvForOfferAmount(offer.amount ?? 0, collateralValue) || (decision && offer.apr !== aprForRiskTier(decision.riskTier)) || !Number.isFinite(offer.termDays) || (offer.termDays ?? 0) <= 0 || !Number.isFinite(offer.poolLiquidity) || (offer.poolLiquidity ?? 0) < (offer.amount ?? 0) || !expiresAt) return false;
  }
  if (!expiresAt) return true;
  const expiryMs = Date.parse(expiresAt);
  return Number.isFinite(expiryMs) && expiryMs > nowMs;
}

export function ltvForOfferAmount(amount: number, collateralValue = 2800): number {
  return Number((amount / collateralValue).toFixed(2));
}

export function aprForRiskTier(riskTier: Decision["riskTier"]): number {
  return riskTier === "A" ? 8.5 : riskTier === "B" ? 11.5 : riskTier === "C" ? 16.5 : 24;
}

export function evaluateRiskGuard(decision: Decision, requestedAmount: number, collateralValue = 2800, poolLiquidity = 250_000): Offer {
  const ltv = requestedAmount / collateralValue;
  const canonicalLtv = ltvForOfferAmount(requestedAmount, collateralValue);
  const apr = aprForRiskTier(decision.riskTier);
  const checks = [
    requestedAmount > 0 && requestedAmount <= 2500,
    ltv <= 0.7,
    apr <= 24,
    decision.confidence >= 0.65,
    decision.freshnessScore >= 0.8,
    decision.pd30 <= 0.35,
    poolLiquidity >= requestedAmount,
  ];
  const blocked = checks.some(check => !check);
  return {
    amount: requestedAmount,
    apr,
    ltv: canonicalLtv,
    collateralValue,
    termDays: 90,
    expiresAt: new Date(Date.now() + 86_400_000).toISOString(),
    poolLiquidity,
    status: blocked ? "Blocked" : "Ready",
    rejectionReason: blocked ? "RiskGuard rejected terms outside amount, LTV, rate, freshness, confidence, or pool liquidity bounds." : undefined,
  };
}

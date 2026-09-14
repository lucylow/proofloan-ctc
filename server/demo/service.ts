import { randomUUID } from "node:crypto";
import { buildFeatureVector, evaluateRiskGuard } from "../underwriting";
import type { LoanSnapshot, ReasonCode } from "@shared/proofloan";
import { isMockEvidence, isReasonCode } from "@shared/proofloan";
import { DemoError } from "./errors";
import { demoAddress, demoHash, demoTxHash } from "./hash";
import { loadDemoConfig, assertDemoEnabled } from "./config";
import { generateDemoScenario } from "./generator";
import { demoLabel } from "./guards";
import { getDemoProfile, listDemoProfiles } from "./profiles";
import type { DemoDataMode, DemoProfileId, DemoSnapshotEnvelope } from "./types";

const ephemeralSnapshots = new Map<string, LoanSnapshot>();
const MAX_EPHEMERAL_SNAPSHOTS = 100;

function demoApplicationId(): string {
  return `DEMO-${randomUUID().replaceAll("-", "").slice(0, 24).toUpperCase()}`;
}

function audit(state: LoanSnapshot["state"], detail: string) {
  const hash = demoHash({ state, detail, t: Date.now() }, 18);
  return { state, label: state, timestamp: new Date().toISOString(), detail, hash };
}

function sleep(ms: number): Promise<void> {
  const delay = Number.isFinite(ms) && ms > 0 ? ms : 0;
  return new Promise(resolve => setTimeout(resolve, delay));
}

function storeSnapshot(snapshot: LoanSnapshot): void {
  if (!ephemeralSnapshots.has(snapshot.applicationId)) {
    while (ephemeralSnapshots.size >= MAX_EPHEMERAL_SNAPSHOTS) {
      const oldest = ephemeralSnapshots.keys().next().value;
      if (typeof oldest !== "string" || !ephemeralSnapshots.delete(oldest)) break;
    }
  }
  ephemeralSnapshots.set(snapshot.applicationId, snapshot);
}

export function scoreDemoSnapshot(snapshot: LoanSnapshot): LoanSnapshot {
  if (!snapshot || !Array.isArray(snapshot.facts)) {
    throw new DemoError("SCORING", "Demo scoring requires a snapshot with facts.");
  }
  if (snapshot.facts.length > 0 && !snapshot.facts.every(isMockEvidence)) {
    throw new DemoError("LIVE_CLAIM", "Demo scoring cannot run on live Attestcoin facts.");
  }
  try {
    snapshot.features = buildFeatureVector(snapshot.facts);
    const pd30 = Math.min(
      0.42,
      Math.max(
        0.03,
        0.12 + snapshot.features.latePayments * 0.08 + snapshot.features.leverageRatio * 0.08 - snapshot.features.repaymentCount * 0.025,
      ),
    );
    const pd90 = Math.min(0.58, pd30 + 0.08);
    if (!Number.isFinite(pd30) || !Number.isFinite(pd90) || pd30 > pd90) {
      throw new DemoError("SCORING", "Demo underwriting produced a non-canonical PD pair.");
    }
    const reasonCodes: ReasonCode[] = [];
    if (snapshot.features.repaymentCount >= 2) reasonCodes.push("STRONG_REPAYMENT_HISTORY");
    if (snapshot.features.latePayments > 0) reasonCodes.push("RECENT_LATE_PAYMENT");
    if (snapshot.features.leverageRatio > 0.8) reasonCodes.push("HIGH_LEVERAGE");
    if (snapshot.features.evidenceCount < 2) reasonCodes.push("SPARSE_EVIDENCE");
    if (reasonCodes.length === 0) reasonCodes.push("SPARSE_EVIDENCE");
    const reasons = reasonCodes.filter(isReasonCode);
    const riskTier = pd30 < 0.1 ? "A" : pd30 < 0.18 ? "B" : pd30 < 0.3 ? "C" : "D";
    const evidenceRoot = demoHash(snapshot.facts.map(fact => fact.proofRoot));
    const confidence = snapshot.features.freshnessScore * Math.min(0.98, 0.68 + snapshot.features.evidenceCount * 0.08);
    snapshot.decision = {
      pd30,
      pd90,
      confidence: Number.isFinite(confidence) ? Math.min(0.99, Math.max(0, confidence)) : 0,
      freshnessScore: snapshot.features.freshnessScore,
      riskTier,
      reasonCodes: reasons,
      modelVersion: "proofloan-demo-underwriter-v1",
      featureVersion: "feature-vector-v0.1.0",
      evidenceRoot,
      policyHash: "riskguard-policy-v0.1.0:demo",
      decisionHash: demoHash({ pd30, pd90, confidence, riskTier, reasons, evidenceRoot }),
    };
    snapshot.state = "Scored";
    snapshot.audit.push(audit("Scored", "Deterministic offline demo underwriting executed; no external AI provider was called."));
    snapshot.offer = evaluateRiskGuard(snapshot.decision, 1500);
    snapshot.state = snapshot.offer.status === "Blocked" ? "Rejected" : "AwaitingAcceptance";
    snapshot.audit.push(
      audit(
        snapshot.state,
        snapshot.offer.status === "Blocked" ? "Demo RiskGuard blocked the scenario." : "Demo RiskGuard prepared a bounded offer.",
      ),
    );
    return snapshot;
  } catch (error) {
    if (error instanceof DemoError) throw error;
    throw new DemoError("SCORING", "Demo underwriting failed before RiskGuard could run.", false, error);
  }
}

export class DemoService {
  public listProfiles() {
    return listDemoProfiles();
  }

  public getProfile(profileId: DemoProfileId) {
    return getDemoProfile(profileId);
  }

  public scenario(profileId: DemoProfileId) {
    return generateDemoScenario(profileId);
  }

  public async create(profileId: DemoProfileId): Promise<DemoSnapshotEnvelope> {
    const config = loadDemoConfig();
    assertDemoEnabled(config);
    if (config.artificialLatencyMs > 0) await sleep(config.artificialLatencyMs);
    const scenario = generateDemoScenario(profileId);
    const snapshot: LoanSnapshot = {
      applicationId: demoApplicationId(),
      walletAddress: scenario.walletAddress,
      sourceTransactionHash: scenario.sourceTransactionHash,
      sourceChain: scenario.sourceChain,
      state: "EvidencePending",
      facts: scenario.facts,
      features: scenario.features,
      audit: [audit("Intake", `Demo profile ${profileId} loaded. ${demoLabel("demo")}`)],
      evidenceMode: "mock",
      demoProfile: profileId,
      source: "ProofLoan deterministic demo generator",
    };
    snapshot.state = "EvidenceVerified";
    snapshot.audit.push(audit("EvidenceVerified", `Synthetic facts generated: ${scenario.facts.length}.`));
    scoreDemoSnapshot(snapshot);
    snapshot.walletAddress = demoAddress(`${profileId}:${snapshot.applicationId}`);
    snapshot.sourceTransactionHash = demoTxHash(`${profileId}:${snapshot.applicationId}`);
    try {
      storeSnapshot(snapshot);
    } catch (error) {
      throw new DemoError("STORE", "Demo snapshot could not be stored in ephemeral preview memory.", true, error);
    }
    return {
      snapshot,
      mode: "demo" as DemoDataMode,
      fallback: {
        used: true,
        reason: "Explicit demo mode",
        provider: "ProofLoan DemoService",
        scenarioId: scenario.scenarioId,
      },
      scenario,
    };
  }

  public get(applicationId: string) {
    const id = applicationId.trim();
    if (id.length < 4) throw new DemoError("VALIDATION", "Demo application id is missing or too short.");
    return ephemeralSnapshots.get(id) ?? null;
  }

  public reset() {
    ephemeralSnapshots.clear();
  }
}

export const demoService = new DemoService();

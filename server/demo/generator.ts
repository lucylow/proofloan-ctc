import type { FeatureVector, VerifiedFact } from "@shared/proofloan";
import { isMockEvidence } from "@shared/proofloan";
import { buildFeatureVector } from "../underwriting";
import { DemoError, isFiniteTimestamp } from "./errors";
import { demoAddress, demoHash, demoProofRoot, demoTxHash } from "./hash";
import { getDemoProfile } from "./profiles";
import type { DemoProfileId, DemoScenario, DemoFailureState } from "./types";

const BASE_SOURCE_BLOCK = 6_500_000;
const BASE_VERIFICATION_BLOCK = 7_100_000;

function freshnessForAge(ageDays: number, override?: VerifiedFact["freshness"]): VerifiedFact["freshness"] {
  if (override) return override;
  if (ageDays <= 7) return "Fresh";
  if (ageDays <= 90) return "Aging";
  return "Stale";
}

function safeNowMs(nowMs: number): number {
  if (!isFiniteTimestamp(nowMs)) {
    throw new DemoError("VALIDATION", "Demo generation requires a finite timestamp.");
  }
  return nowMs;
}

export function buildDemoFacts(profileId: DemoProfileId, nowMs = Date.now()): VerifiedFact[] {
  const profile = getDemoProfile(profileId);
  const timestamp = safeNowMs(nowMs);
  if (!Array.isArray(profile.facts) || profile.facts.length === 0) {
    throw new DemoError("GENERATION", `Demo profile ${profileId} has no synthetic facts.`);
  }
  const chain = profile.chain;
  const walletAddress = demoAddress(profile.walletSeed);
  const now = new Date(timestamp).toISOString();
  const facts = profile.facts.map((spec, index) => {
    const amount = Number.isFinite(spec.amount) && spec.amount >= 0 ? spec.amount : 0;
    const ageDays = Number.isFinite(spec.ageDays) ? Math.max(0, spec.ageDays) : 0;
    const sourceBlock = BASE_SOURCE_BLOCK + (Number.isFinite(spec.sourceBlockOffset) ? spec.sourceBlockOffset : index);
    const verificationBlock = BASE_VERIFICATION_BLOCK + (Number.isFinite(spec.verificationOffset) ? spec.verificationOffset : 1);
    const txHash = demoTxHash(`${profile.transactionSeed}:${index}`);
    const observedAt = new Date(timestamp - ageDays * 86_400_000).toISOString();
    return {
      id: `demo_vf_${demoHash({ profileId, index, walletAddress })}`,
      chain,
      sourceBlock,
      txHash,
      eventType: spec.eventType,
      amount: `${amount.toFixed(2)} ${spec.asset ?? "USDC"}`,
      asset: spec.asset ?? "USDC",
      verificationBlock,
      verifiedAt: now,
      observedAt,
      freshness: freshnessForAge(ageDays, spec.freshness),
      proofRoot: demoProofRoot(`${profileId}:${index}:${sourceBlock}`),
      proofWorker: "Attestcoin proof worker" as const,
      evidenceMode: "mock" as const,
      demoProfile: profileId,
      source: "ProofLoan deterministic demo generator",
    };
  });
  if (!facts.every(isMockEvidence)) {
    throw new DemoError("GENERATION", `Demo profile ${profileId} produced unlabeled facts.`);
  }
  return facts;
}

export function buildDemoFailures(profileId: DemoProfileId): DemoFailureState[] {
  if (profileId === "operator-down") return [{ enabled: true, kind: "attestor", message: "Demo Attestor operator is marked unavailable.", retryAfterMs: 5_000 }];
  if (profileId === "proof-builder-down") return [{ enabled: true, kind: "proof-builder", message: "Demo Proof Builder is unavailable.", retryAfterMs: 5_000 }];
  if (profileId === "database-offline") return [{ enabled: true, kind: "database", message: "Demo persistence layer is unavailable; use ephemeral preview storage." }];
  return [];
}

export function generateDemoScenario(profileId: DemoProfileId, nowMs = Date.now()): DemoScenario {
  const timestamp = safeNowMs(nowMs);
  const profile = getDemoProfile(profileId);
  const facts = buildDemoFacts(profileId, timestamp);
  const walletAddress = demoAddress(profile.walletSeed);
  const sourceTransactionHash = facts[0]?.txHash ?? demoTxHash(profile.transactionSeed);
  let features: FeatureVector;
  try {
    features = buildFeatureVector(facts, timestamp);
  } catch (error) {
    throw new DemoError("GENERATION", `Demo feature vector could not be built for ${profileId}.`, false, error);
  }
  return {
    scenarioId: `demo_${demoHash({ profileId, nowMs: new Date(timestamp).toISOString().slice(0, 10) })}`,
    profileId,
    mode: "demo",
    generatedAt: new Date(timestamp).toISOString(),
    walletAddress,
    sourceChain: profile.chain,
    sourceTransactionHash,
    facts,
    features,
    failures: buildDemoFailures(profileId),
    notes: [
      "Synthetic deterministic data; no live-chain claim is made.",
      "Mock evidence is clearly marked with evidenceMode=mock.",
      "The scenario is intended for demos, judges, UI walkthroughs, and offline development.",
    ],
  };
}

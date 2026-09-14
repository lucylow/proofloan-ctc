import type { VerifiedFact, FeatureVector } from "@shared/proofloan";
import { isMockEvidence } from "@shared/proofloan";
import { buildFeatureVector } from "../../underwriting";
import { DemoError, isFiniteTimestamp } from "../errors";
import { demoAddress, demoHash, demoProofRoot, demoTxHash } from "../hash";
import type { ExtendedScenarioCase, ExtendedScenarioBatch } from "./types";

const DAY = 86_400_000;
const SOURCE_BASE = 6_700_000;
const VERIFY_BASE = 7_200_000;

function safeNowMs(nowMs: number): number {
  if (!isFiniteTimestamp(nowMs)) {
    throw new DemoError("VALIDATION", "Extended demo materialization requires a finite timestamp.");
  }
  return nowMs;
}

export function factsForCase(input: ExtendedScenarioCase, nowMs = Date.now()): VerifiedFact[] {
  const timestamp = safeNowMs(nowMs);
  if (!input || !Array.isArray(input.facts) || input.facts.length === 0) {
    throw new DemoError("CATALOG", `Extended demo case ${input?.id ?? "unknown"} has no synthetic facts.`);
  }
  const facts = input.facts.map((spec, index) => {
    const amount = Number.isFinite(spec.amount) && spec.amount >= 0 ? spec.amount : 0;
    const ageDays = Number.isFinite(spec.ageDays) ? Math.max(0, spec.ageDays) : 0;
    const sourceBlock = SOURCE_BASE + (Number.isFinite(spec.sourceBlockOffset) ? spec.sourceBlockOffset : index);
    const verificationBlock = VERIFY_BASE + (Number.isFinite(spec.verificationOffset) ? spec.verificationOffset : 1);
    const observedAt = new Date(timestamp - ageDays * DAY).toISOString();
    return {
      id: `ext_vf_${demoHash({ id: input.id, index, sourceBlock })}`,
      chain: input.chain,
      sourceBlock,
      txHash: demoTxHash(`${input.transactionSeed}:${index}`),
      eventType: spec.eventType,
      amount: `${amount.toFixed(2)} ${spec.asset ?? "USDC"}`,
      asset: spec.asset ?? "USDC",
      verificationBlock,
      verifiedAt: new Date(timestamp).toISOString(),
      observedAt,
      freshness: spec.freshness ?? (ageDays <= 7 ? "Fresh" : ageDays <= 90 ? "Aging" : "Stale"),
      proofRoot: demoProofRoot(`${input.id}:${sourceBlock}:${index}`),
      proofWorker: "Attestcoin proof worker" as const,
      evidenceMode: "mock" as const,
      demoProfile: input.id,
      source: "ProofLoan extended deterministic mock catalog",
    };
  });
  if (!facts.every(isMockEvidence)) {
    throw new DemoError("GENERATION", `Extended demo case ${input.id} produced unlabeled facts.`);
  }
  return facts;
}

export function featureVectorForCase(input: ExtendedScenarioCase, nowMs = Date.now()): FeatureVector {
  try {
    return buildFeatureVector(factsForCase(input, nowMs), nowMs);
  } catch (error) {
    if (error instanceof DemoError) throw error;
    throw new DemoError("GENERATION", `Extended demo case ${input.id} could not build a feature vector.`, false, error);
  }
}

export function materializeCase(input: ExtendedScenarioCase, nowMs = Date.now()) {
  const timestamp = safeNowMs(nowMs);
  const facts = factsForCase(input, timestamp);
  const features = featureVectorForCase(input, timestamp);
  return {
    scenarioId: `extended_${demoHash({ id: input.id, day: new Date(timestamp).toISOString().slice(0, 10) })}`,
    id: input.id,
    label: input.label,
    kind: input.kind,
    description: input.description,
    walletAddress: demoAddress(input.walletSeed),
    sourceTransactionHash: facts[0]?.txHash ?? demoTxHash(input.transactionSeed),
    chain: input.chain,
    facts,
    features,
    failure: input.failure ?? null,
    expectations: input.expectations,
    tags: input.tags,
    demoOnly: true as const,
  };
}

export function buildBatch(cases: ExtendedScenarioCase[], nowMs = Date.now()): ExtendedScenarioBatch {
  const timestamp = safeNowMs(nowMs);
  if (!Array.isArray(cases)) {
    throw new DemoError("CATALOG", "Extended demo batch generation requires a case list.");
  }
  const countsByKind: Record<string, number> = {};
  for (const item of cases) {
    countsByKind[item.kind] = (countsByKind[item.kind] ?? 0) + 1;
  }
  return { generatedAt: new Date(timestamp).toISOString(), total: cases.length, cases, countsByKind };
}

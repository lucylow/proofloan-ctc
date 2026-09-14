import { createHash } from "node:crypto";
import type { Decision, FeatureVector, ReasonCode, SourceChain, VerifiedFact } from "@shared/proofloan";
import type { AiFeatureContribution, AiConfidenceBand, AiRecommendation, AiMockScenarioId } from "@shared/aiMockTypes";

export const AI_MOCK_MODEL_VERSION = "proofloan-ai-mock-v2.0.0";
export const AI_MOCK_FEATURE_VERSION = "ai-feature-vector-mock-v2";
export const AI_MOCK_GENERATED_AT = "2026-09-13T20:00:00.000Z";
export const AI_MOCK_SOURCE = "ai-mock";

export function stableHash(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex").slice(0, 18);
}

const chainConfig: Record<SourceChain, { prefix: string; block: number }> = {
  "Ethereum Sepolia": { prefix: "0x71", block: 6_900_000 },
  "Ethereum Mainnet": { prefix: "0xa1", block: 19_400_000 },
  "Polygon Amoy": { prefix: "0x9b", block: 13_100_000 },
};

export type AiMockFactSpec =
  | { eventType: VerifiedFact["eventType"]; amount: number; ageDays: number; asset?: string }
  | [VerifiedFact["eventType"], number, number]
  | [VerifiedFact["eventType"], number, number, string];

function normalizeFactSpec(row: AiMockFactSpec): {
  eventType: VerifiedFact["eventType"];
  amount: number;
  ageDays: number;
  asset?: string;
} {
  if (Array.isArray(row)) {
    return { eventType: row[0], amount: row[1], ageDays: row[2], asset: row[3] };
  }
  return row;
}

export function makeWallet(scenarioId: AiMockScenarioId): string {
  return `0x${stableHash({ scenarioId, wallet: true }).padEnd(40, "0").slice(0, 40)}`;
}

export function makeTx(scenarioId: AiMockScenarioId, index: number, chain: SourceChain): string {
  const prefix = chainConfig[chain].prefix;
  return `${prefix}${stableHash({ scenarioId, index, chain }).repeat(4).slice(0, 62)}`;
}

export function makeFacts(
  scenarioId: AiMockScenarioId,
  chain: SourceChain,
  spec: AiMockFactSpec[],
): VerifiedFact[] {
  const cfg = chainConfig[chain];
  const now = new Date(AI_MOCK_GENERATED_AT).getTime();
  return spec.map((raw, index) => {
    const row = normalizeFactSpec(raw);
    const observedAt = new Date(now - row.ageDays * 86_400_000).toISOString();
    const freshness: VerifiedFact["freshness"] = row.ageDays <= 14 ? "Fresh" : row.ageDays <= 90 ? "Aging" : "Stale";
    return {
      id: `ai_${stableHash({ scenarioId, chain, index, id: true })}`,
      chain,
      sourceBlock: cfg.block - index * 2_371 - Math.round(row.ageDays * 1_240),
      txHash: makeTx(scenarioId, index, chain),
      eventType: row.eventType,
      amount: `${row.amount.toLocaleString("en-US")} ${row.asset ?? "USDC"}`,
      asset: row.asset ?? "USDC",
      verificationBlock: cfg.block + index * 7,
      verifiedAt: AI_MOCK_GENERATED_AT,
      observedAt,
      freshness,
      proofRoot: `0x${stableHash({ scenarioId, chain, index, proof: true })}`,
      proofWorker: "Attestcoin proof worker",
      verificationStatus: "preview",
      evidenceMode: "mock",
      demoProfile: scenarioId,
      source: AI_MOCK_SOURCE,
    };
  });
}

export function featuresFromFacts(facts: VerifiedFact[], walletAgeDays: number): FeatureVector {
  const amount = (fact: VerifiedFact) => Number.parseFloat(fact.amount.replace(/[^0-9.]/g, "")) || 0;
  const ageDays = (fact: VerifiedFact) => Math.max(0, (Date.parse(AI_MOCK_GENERATED_AT) - Date.parse(fact.observedAt)) / 86_400_000);
  const repayments = facts.filter(f => f.eventType === "REPAYMENT");
  const late = facts.filter(f => f.eventType === "LATE_PAYMENT");
  const collateral = facts.filter(f => f.eventType === "COLLATERAL_DEPOSIT").reduce((s, f) => s + amount(f), 0);
  const leverage = repayments.reduce((s, f) => s + amount(f), 0) / Math.max(collateral, 1);
  const volume = (days: number) => facts.filter(f => ageDays(f) <= days).reduce((s, f) => s + amount(f), 0);
  const freshCount = facts.filter(f => f.freshness === "Fresh").length;
  const freshnessScore = facts.length === 0 ? 0 : Number((freshCount / facts.length).toFixed(2));
  return {
    repaymentCount: repayments.length,
    latePayments: late.length,
    leverageRatio: Number(leverage.toFixed(2)),
    walletAgeDays,
    volume7d: Math.round(volume(7)),
    volume30d: Math.round(volume(30)),
    volume180d: Math.round(volume(180)),
    evidenceCount: facts.length,
    freshnessScore,
  };
}

export function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

export function scoreFeatures(features: FeatureVector): {
  pd30: number;
  pd90: number;
  confidence: number;
  riskTier: Decision["riskTier"];
  recommendation: AiRecommendation;
  reasonCodes: ReasonCode[];
} {
  let risk = 0.42;
  risk += Math.min(features.latePayments * 0.12, 0.36);
  risk += Math.min(Math.max(features.leverageRatio - 0.4, 0) * 0.18, 0.22);
  risk += features.evidenceCount === 0 ? 0.25 : 0;
  risk -= Math.min(features.repaymentCount * 0.035, 0.20);
  risk -= Math.min(features.freshnessScore * 0.14, 0.14);
  risk = clamp01(risk);
  const pd30 = Number((risk * 0.72).toFixed(4));
  const pd90 = Number(Math.min(0.99, Math.max(pd30, risk * 1.18)).toFixed(4));
  const confidence = Number(clamp01(0.45 + features.evidenceCount * 0.045 + features.freshnessScore * 0.3 - features.latePayments * 0.03).toFixed(4));
  const riskTier: Decision["riskTier"] = pd90 < 0.2 ? "A" : pd90 < 0.38 ? "B" : pd90 < 0.62 ? "C" : "D";
  const reasonCodes: ReasonCode[] = [];
  if (features.repaymentCount >= 3 && features.latePayments === 0) reasonCodes.push("STRONG_REPAYMENT_HISTORY");
  if (features.latePayments > 0) reasonCodes.push("RECENT_LATE_PAYMENT");
  if (features.leverageRatio > 1.4) reasonCodes.push("HIGH_LEVERAGE");
  if (features.evidenceCount < 2) reasonCodes.push("SPARSE_EVIDENCE");
  const recommendation: AiRecommendation = riskTier === "A" ? "APPROVE" : riskTier === "D" ? "REJECT" : "REVIEW";
  return { pd30, pd90, confidence, riskTier, recommendation, reasonCodes };
}

export function explain(features: FeatureVector, facts: VerifiedFact[]): AiFeatureContribution[] {
  const ids = facts.slice(0, 4).map(f => f.id);
  return [
    {
      feature: "repaymentCount",
      value: features.repaymentCount,
      normalized: clamp01(features.repaymentCount / 8),
      weight: 0.31,
      contribution: Number((Math.min(features.repaymentCount / 8, 1) * 0.31).toFixed(4)),
      direction: features.repaymentCount >= 3 ? "positive" : "neutral",
      explanation: features.repaymentCount >= 3 ? "Repeated repayment events support a stronger repayment signal." : "There is limited repayment history available to the model.",
      evidenceIds: ids,
    },
    {
      feature: "latePayments",
      value: features.latePayments,
      normalized: clamp01(features.latePayments / 4),
      weight: 0.28,
      contribution: Number((Math.min(features.latePayments / 4, 1) * 0.28).toFixed(4)),
      direction: features.latePayments > 0 ? "negative" : "positive",
      explanation: features.latePayments > 0 ? "Late-payment evidence increases modeled repayment risk." : "No late-payment events are present in the verified sample.",
      evidenceIds: facts.filter(f => f.eventType === "LATE_PAYMENT").map(f => f.id),
    },
    {
      feature: "leverageRatio",
      value: features.leverageRatio,
      normalized: clamp01(features.leverageRatio / 2),
      weight: 0.19,
      contribution: Number((clamp01(features.leverageRatio / 2) * 0.19).toFixed(4)),
      direction: features.leverageRatio > 1.4 ? "negative" : "positive",
      explanation: features.leverageRatio > 1.4 ? "Repayment volume relative to collateral indicates elevated leverage." : "Collateral coverage is consistent with the modeled exposure.",
      evidenceIds: facts.filter(f => f.eventType === "COLLATERAL_DEPOSIT").map(f => f.id),
    },
    {
      feature: "freshnessScore",
      value: features.freshnessScore,
      normalized: features.freshnessScore,
      weight: 0.22,
      contribution: Number((features.freshnessScore * 0.22).toFixed(4)),
      direction: features.freshnessScore >= 0.6 ? "positive" : features.freshnessScore > 0 ? "neutral" : "negative",
      explanation: features.freshnessScore >= 0.6 ? "Most evidence is recent enough to retain strong contextual value." : "Aging or sparse evidence lowers confidence in the current state.",
      evidenceIds: facts.map(f => f.id),
    },
  ];
}

export function confidenceBand(confidence: number): AiConfidenceBand {
  if (confidence >= 0.9) return "very-high";
  if (confidence >= 0.75) return "high";
  if (confidence >= 0.55) return "medium";
  if (confidence >= 0.35) return "low";
  return "very-low";
}

export function makeDecision(features: FeatureVector, facts: VerifiedFact[]): {
  decision: Decision;
  recommendation: AiRecommendation;
  explanations: AiFeatureContribution[];
} {
  const scored = scoreFeatures(features);
  const explanations = explain(features, facts);
  const evidenceRoot = `0x${stableHash(facts.map(f => f.proofRoot))}`;
  return {
    recommendation: scored.recommendation,
    explanations,
    decision: {
      pd30: scored.pd30,
      pd90: scored.pd90,
      confidence: scored.confidence,
      freshnessScore: features.freshnessScore,
      riskTier: scored.riskTier,
      reasonCodes: scored.reasonCodes,
      modelVersion: AI_MOCK_MODEL_VERSION,
      featureVersion: AI_MOCK_FEATURE_VERSION,
      evidenceRoot,
      policyHash: "riskguard-policy-v0.1.0:amount-ltv-rate-freshness-confidence-liquidity",
      decisionHash: `0x${stableHash({ features, evidenceRoot, recommendation: scored.recommendation })}`,
      featureFingerprint: stableHash(features),
    },
  };
}

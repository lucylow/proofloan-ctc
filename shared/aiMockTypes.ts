import type { Decision, FeatureVector, VerifiedFact, SourceChain } from "@shared/proofloan";

export const AI_MOCK_SCENARIO_IDS = [
  "hero",
  "strong-repayment",
  "cross-chain-wealth",
  "recent-late-payment",
  "high-leverage",
  "sparse-evidence",
  "fresh-evidence",
  "aging-evidence",
  "stale-evidence",
  "proof-delayed",
  "proof-rejected",
  "partial-attestation",
  "multi-chain",
  "new-wallet",
  "high-risk",
  "mixed-signals",
  "collateral-heavy",
  "stable-activity",
  "volatile-activity",
  "low-liquidity",
  "recovery",
  "judge",
] as const;

export type AiMockScenarioId = (typeof AI_MOCK_SCENARIO_IDS)[number];

export type AiSignalDirection = "positive" | "negative" | "neutral";
export type AiConfidenceBand = "very-high" | "high" | "medium" | "low" | "very-low";
export type AiRecommendation = "APPROVE" | "REVIEW" | "REJECT";
export type AiMockFailureMode =
  | "none"
  | "timeout"
  | "attestation_pending"
  | "invalid_proof"
  | "malformed_payload"
  | "stale_cache";

export type AiFeatureContribution = {
  feature: string;
  value: number;
  normalized: number;
  weight: number;
  contribution: number;
  direction: AiSignalDirection;
  explanation: string;
  evidenceIds: string[];
};

export type AiNarrative = {
  summary: string;
  strengths: string[];
  concerns: string[];
  evidenceChain: string[];
  actionRationale: string;
  disclaimer: string;
};

export type AiScenario = {
  id: AiMockScenarioId;
  title: string;
  description: string;
  walletAddress: string;
  sourceChains: SourceChain[];
  facts: VerifiedFact[];
  features: FeatureVector;
  decision: Decision;
  recommendation: AiRecommendation;
  confidenceBand: AiConfidenceBand;
  modelExplanation: AiFeatureContribution[];
  narrative: AiNarrative;
  failureMode: AiMockFailureMode;
  proofLatencyMs: number;
  generatedAt: string;
  tags: string[];
};

export type AiDashboardSnapshot = {
  scenarioId: AiMockScenarioId;
  modelVersion: string;
  scenario: AiScenario;
  recommendation: AiRecommendation;
  confidenceBand: AiConfidenceBand;
  featureContributions: AiFeatureContribution[];
  narrative: AiNarrative;
  featureDrift: Record<string, number>;
  whatIf: Array<{
    label: string;
    changedFeature: string;
    baseline: number;
    counterfactual: number;
    recommendation: AiRecommendation;
    confidence: number;
  }>;
};

export type AiMockDatasetStats = {
  scenarios: number;
  facts: number;
  repayments: number;
  collateralDeposits: number;
  latePayments: number;
  chains: number;
  recommendations: Record<AiRecommendation, number>;
};

export function isAiMockScenarioId(value: string): value is AiMockScenarioId {
  return (AI_MOCK_SCENARIO_IDS as readonly string[]).includes(value);
}

export function assertAiMockScenarioId(value: string): AiMockScenarioId {
  if (!isAiMockScenarioId(value)) {
    throw new Error(`Unknown AI mock scenario: ${value}`);
  }
  return value;
}

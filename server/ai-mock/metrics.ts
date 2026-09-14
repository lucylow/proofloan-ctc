import type { AiScenario } from "@shared/aiMockTypes";

export function summarizeAiScenario(scenario: AiScenario) {
  return {
    id: scenario.id,
    riskTier: scenario.decision.riskTier,
    pd30: scenario.decision.pd30,
    pd90: scenario.decision.pd90,
    confidence: scenario.decision.confidence,
    evidenceCount: scenario.features.evidenceCount,
    freshnessScore: scenario.features.freshnessScore,
    latePayments: scenario.features.latePayments,
    repaymentCount: scenario.features.repaymentCount,
    leverageRatio: scenario.features.leverageRatio,
    recommendation: scenario.recommendation,
    proofLatencyMs: scenario.proofLatencyMs,
  };
}

export function summarizeAllAiScenarios(scenarios: AiScenario[]) {
  return scenarios.map(summarizeAiScenario);
}

import { AI_MOCK_SCENARIO_IDS, isAiMockScenarioId, type AiDashboardSnapshot, type AiMockScenarioId, type AiScenario } from "@shared/aiMockTypes";

export { AI_MOCK_SCENARIO_IDS, isAiMockScenarioId };
export type { AiDashboardSnapshot, AiMockScenarioId, AiScenario };

export type AiMockApi = {
  scenario: AiScenario;
  snapshot?: AiDashboardSnapshot;
};

export function toAiMockSummary(payload: AiMockApi) {
  return {
    scenarioId: payload.scenario.id,
    title: payload.scenario.title,
    recommendation: payload.scenario.recommendation,
    confidence: payload.scenario.decision.confidence,
    riskTier: payload.scenario.decision.riskTier,
    evidenceCount: payload.scenario.features.evidenceCount,
    freshnessScore: payload.scenario.features.freshnessScore,
  };
}

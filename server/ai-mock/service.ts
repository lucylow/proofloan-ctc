import { getAiMockScenario, listAiMockScenarios, buildAiMockStats, buildAiDashboardSnapshot, AI_MOCK_DATASET_HASH } from "./index";
import { assertAiMockScenarioId, type AiMockScenarioId } from "@shared/aiMockTypes";

export function getAiMockDataset() {
  return {
    datasetHash: AI_MOCK_DATASET_HASH,
    stats: buildAiMockStats(),
    scenarios: listAiMockScenarios(),
    warning: "AI mock fixtures are synthetic. They are not live Attestcoin proofs and cannot authorize a Creditcoin action.",
  };
}

export function getAiMockDashboard(scenarioId: AiMockScenarioId | string) {
  return buildAiDashboardSnapshot(assertAiMockScenarioId(String(scenarioId)));
}

export function simulateAiFailure(scenarioId: AiMockScenarioId | string) {
  const scenario = getAiMockScenario(assertAiMockScenarioId(String(scenarioId)));
  if (scenario.failureMode === "none") return { ok: true as const, scenario };
  return {
    ok: false as const,
    code: scenario.failureMode,
    message: `Mock AI/proof pipeline failure: ${scenario.failureMode}`,
    retryable: scenario.failureMode === "timeout" || scenario.failureMode === "attestation_pending" || scenario.failureMode === "stale_cache",
  };
}

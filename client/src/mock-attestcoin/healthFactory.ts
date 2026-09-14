import { MOCK_NOW_ISO } from "./constants";
import type { MockHealthStatus, MockProtocolHealth, MockScenario } from "./types";

export function createMockHealth(scenario: MockScenario): MockProtocolHealth {
  const degraded = scenario === "recovery" || scenario === "proof-delay";
  const offline = scenario === "empty";
  const status: MockHealthStatus = offline ? "offline" : degraded ? "degraded" : "healthy";

  return {
    creditcoinRpc: status,
    proofBuilder: scenario === "proof-rejected" ? "degraded" : status,
    sourceRpc: status,
    lastCheckedAt: MOCK_NOW_ISO,
    latencyMs: offline ? 0 : degraded ? 2100 : 240,
    message: offline
      ? "Presentation dataset is empty; live proofs still use the production adapter."
      : degraded
        ? "Mock protocol health is degraded for this scenario."
        : undefined,
  };
}

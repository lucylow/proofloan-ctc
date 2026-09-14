import { MOCK_SCENARIOS, MOCK_SCENARIO_DESCRIPTIONS, MOCK_SCENARIO_LABELS, type MockScenario } from "./constants";
import { createMockDataset } from "./createMockDataset";
import type { MockDataset } from "./types";

export function isMockScenario(value: string): value is MockScenario {
  return (MOCK_SCENARIOS as readonly string[]).includes(value);
}

export function listMockScenarios() {
  return MOCK_SCENARIOS.map(value => ({
    value,
    label: MOCK_SCENARIO_LABELS[value],
    description: MOCK_SCENARIO_DESCRIPTIONS[value],
  }));
}

export function datasetForScenario(scenario: MockScenario): MockDataset {
  return createMockDataset(scenario);
}

export function mapLegacyDemoScenario(value: string): MockScenario {
  if (isMockScenario(value)) return value;
  if (value === "healthy") return "hero";
  if (value === "active-loan") return "strong-repayment";
  if (value === "review") return "aging-evidence";
  if (value === "risk-warning") return "high-risk";
  if (value === "error-recovery") return "recovery";
  return "hero";
}

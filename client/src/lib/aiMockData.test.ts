import { describe, expect, it } from "vitest";
import { AI_MOCK_SCENARIO_IDS, isAiMockScenarioId, toAiMockSummary } from "./aiMockData";
import type { AiScenario } from "@shared/aiMockTypes";

const sample = {
  id: "hero",
  title: "Hero evidence file",
  recommendation: "APPROVE",
  decision: { confidence: 0.9, riskTier: "A" },
  features: { evidenceCount: 4, freshnessScore: 0.75 },
} as AiScenario;

describe("aiMockData client helpers", () => {
  it("recognizes the 22 named scenarios", () => {
    expect(AI_MOCK_SCENARIO_IDS).toHaveLength(22);
    expect(isAiMockScenarioId("judge")).toBe(true);
    expect(isAiMockScenarioId("live-oracle")).toBe(false);
  });

  it("summarizes a mock payload without promoting it to live evidence", () => {
    const summary = toAiMockSummary({ scenario: sample });
    expect(summary.scenarioId).toBe("hero");
    expect(summary.evidenceCount).toBe(4);
  });
});

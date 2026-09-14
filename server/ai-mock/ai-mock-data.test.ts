import { describe, expect, it } from "vitest";
import { isLiveTxHash, isMockEvidence } from "@shared/proofloan";
import { AI_MOCK_SCENARIO_IDS } from "@shared/aiMockTypes";
import { buildAiDashboardSnapshot, buildAiMockStats, getAiMockScenario, listAiMockScenarios } from "./index";
import { simulateAiFailure } from "./service";
import { validateAiDashboard, validateAiScenario } from "./validators";

describe("ProofLoan AI mock dataset", () => {
  it("contains a broad set of named scenarios", () => {
    const scenarios = listAiMockScenarios();
    expect(scenarios.length).toBe(AI_MOCK_SCENARIO_IDS.length);
    expect(scenarios.length).toBeGreaterThanOrEqual(20);
  });

  it("keeps fixtures structurally valid and labeled as mock", () => {
    for (const scenario of listAiMockScenarios()) {
      expect(validateAiScenario(scenario)).toEqual([]);
      expect(scenario.decision.confidence).toBeGreaterThanOrEqual(0);
      expect(scenario.decision.confidence).toBeLessThanOrEqual(1);
      expect(scenario.decision.pd90).toBeGreaterThanOrEqual(scenario.decision.pd30);
      expect(scenario.facts.every(isMockEvidence)).toBe(true);
      expect(scenario.facts.every(fact => isLiveTxHash(fact.txHash))).toBe(true);
    }
  });

  it("produces a deterministic dataset summary", () => {
    const stats = buildAiMockStats();
    expect(stats.scenarios).toBeGreaterThanOrEqual(20);
    expect(stats.facts).toBeGreaterThan(30);
    expect(Object.values(stats.recommendations).reduce((a, b) => a + b, 0)).toBe(stats.scenarios);
  });

  it("supports what-if dashboard data", () => {
    const snapshot = buildAiDashboardSnapshot("hero");
    expect(snapshot.whatIf.length).toBe(3);
    expect(validateAiDashboard(snapshot)).toEqual([]);
  });

  it("keeps the hero scenario explainable", () => {
    const scenario = getAiMockScenario("hero");
    expect(scenario.narrative.evidenceChain.length).toBeGreaterThan(0);
    expect(scenario.modelExplanation.length).toBeGreaterThan(2);
    expect(scenario.narrative.disclaimer).toMatch(/advisory/i);
  });

  it("simulates retryable proof-delay failures without minting live evidence", () => {
    const delayed = simulateAiFailure("proof-delayed");
    expect(delayed.ok).toBe(false);
    if (delayed.ok) return;
    expect(delayed.retryable).toBe(true);
    expect(delayed.code).toBe("attestation_pending");
  });
});

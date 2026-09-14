import { describe, expect, it } from "vitest";
import { MOCK_SCENARIOS } from "../constants";
import { createMockDataset } from "../createMockDataset";
import { datasetForScenario, isMockScenario, listMockScenarios, mapLegacyDemoScenario } from "../scenarios";
import { toDemoDataset } from "../toDemo";
import { validateDemoData } from "@/demo/validation/demoSchema";

describe("mock Attestcoin scenarios", () => {
  it("lists the fourteen presentation scenarios", () => {
    expect(listMockScenarios()).toHaveLength(14);
    expect(MOCK_SCENARIOS).toEqual([
      "hero",
      "cross-chain-wealth",
      "strong-repayment",
      "fresh-evidence",
      "aging-evidence",
      "proof-delay",
      "proof-rejected",
      "partial-attestation",
      "multi-chain",
      "new-wallet",
      "high-risk",
      "empty",
      "recovery",
      "judge",
    ]);
  });

  it("maps legacy demo names onto mock scenarios", () => {
    expect(mapLegacyDemoScenario("healthy")).toBe("hero");
    expect(mapLegacyDemoScenario("active-loan")).toBe("strong-repayment");
    expect(mapLegacyDemoScenario("review")).toBe("aging-evidence");
    expect(mapLegacyDemoScenario("risk-warning")).toBe("high-risk");
    expect(mapLegacyDemoScenario("error-recovery")).toBe("recovery");
    expect(mapLegacyDemoScenario("judge")).toBe("judge");
    expect(isMockScenario("missing")).toBe(false);
  });

  it("produces a distinct dataset for each scenario and a valid demo mapping", () => {
    const fingerprints = MOCK_SCENARIOS.map(scenario => {
      const dataset = datasetForScenario(scenario);
      const mapped = toDemoDataset(dataset);
      const validated = validateDemoData(mapped);
      expect(validated.ok, scenario).toBe(true);
      expect(dataset.scenario).toBe(scenario);
      return JSON.stringify({
        applications: dataset.applications.length,
        facts: dataset.facts.length,
        health: dataset.health.creditcoinRpc,
        risk: dataset.applications[0]?.riskTier,
        freshness: dataset.facts.map(fact => fact.freshness),
        proofs: dataset.proofRequests.map(proof => proof.status),
      });
    });

    expect(new Set(fingerprints).size).toBeGreaterThan(8);
  });

  it("marks aging evidence as aging or stale", () => {
    const dataset = createMockDataset("aging-evidence");
    expect(dataset.facts.every(fact => fact.freshness === "Aging" || fact.freshness === "Stale")).toBe(true);
  });

  it("uses a young wallet in the new-wallet scenario", () => {
    const dataset = createMockDataset("new-wallet");
    expect(dataset.wallets[0]?.walletAgeDays).toBeLessThan(30);
  });
});

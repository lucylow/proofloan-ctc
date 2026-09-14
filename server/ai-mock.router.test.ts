import { describe, expect, it } from "vitest";
import type { TrpcContext } from "./_core/context";
import { isMockEvidence } from "@shared/proofloan";
import { aiMockRouter } from "./ai-mock/router";

function createContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("aiMock tRPC router", () => {
  it("lists the deterministic AI mock dataset", async () => {
    const caller = aiMockRouter.createCaller(createContext());
    const dataset = await caller.list();
    expect(dataset.stats.scenarios).toBeGreaterThanOrEqual(20);
    expect(dataset.warning).toMatch(/not live Attestcoin/i);
    expect(dataset.scenarios.every(scenario => scenario.facts.every(isMockEvidence))).toBe(true);
  });

  it("returns dashboard, failure simulation, and scenario details", async () => {
    const caller = aiMockRouter.createCaller(createContext());
    const dashboard = await caller.dashboard({ scenarioId: "judge" });
    expect(dashboard.scenarioId).toBe("judge");
    expect(dashboard.whatIf.length).toBe(3);
    expect(dashboard.scenario.facts.every(isMockEvidence)).toBe(true);

    const delayed = await caller.simulateFailure({ scenarioId: "proof-delayed" });
    expect(delayed.ok).toBe(false);

    const rejected = await caller.simulateFailure({ scenarioId: "proof-rejected" });
    expect(rejected.ok).toBe(false);
    if (!rejected.ok) expect(rejected.retryable).toBe(false);
  });
});

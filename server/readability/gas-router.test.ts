import { beforeEach, describe, expect, it } from "vitest";
import type { TrpcContext } from "../_core/context";
import { readabilityRouter } from "./router";
import { resetReadabilityRuntime } from "./runtime";

function createContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("readability gas API", () => {
  beforeEach(() => {
    resetReadabilityRuntime();
  });

  it("exposes the official continuity estimator and submit-now plan", async () => {
    const caller = readabilityRouter.createCaller(createContext());
    const estimate = await caller.estimateGas({
      continuityHashCount: 10,
      merkleSiblingCount: 1,
      encodedTransactionBytes: 1000,
    });
    expect(estimate.officialCtc).toBeCloseTo(2.3e-5 + 2.9e-6, 12);
    expect(estimate.safe).toBe(true);
    const decision = await caller.optimizeGas({
      continuityHashCount: 10,
      merkleSiblingCount: 1,
      encodedTransactionBytes: 1000,
      eventBlock: 100,
      attestedBlock: 110,
    });
    expect(decision.action).toBe("submit-now");
    const comparison = await caller.compareGas({
      continuityNow: 10,
      continuityLater: 1010,
    });
    expect(comparison.officialMultiplier).toBeGreaterThan(1);
    const policy = await caller.gasPolicy();
    expect(policy.maxTransactionBytes).toBe(500_000);
    expect(policy.workerEnforcement).toBe(false);
    const health = await caller.health();
    expect(health.gas.officialModel).toContain("2.9e-7");
  });
});

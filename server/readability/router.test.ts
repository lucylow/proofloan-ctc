import { beforeEach, describe, expect, it } from "vitest";
import { appRouter } from "../routers";
import type { TrpcContext } from "../_core/context";
import { resetReadabilityRuntime } from "./runtime";
import { fixtureReadabilityQuery, fixtureSourceEvent } from "./fixtures";

function createContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("readability router", () => {
  beforeEach(() => {
    resetReadabilityRuntime();
  });

  it("exposes health, policy, and pipeline", async () => {
    const caller = appRouter.createCaller(createContext());
    const health = await caller.readability.health();
    expect(health.status).toBe("ok");
    expect(health.pipeline[0]).toBe("source-event");
    expect(health.pipeline.at(-1)).toBe("business-logic");
    expect(health.adapters.preview.production).toBe(false);
    expect(health.adapters.live.production).toBe(true);
    expect(health.policy.forbidden).toContain("Transfer");
    const proving = await caller.transactionProving.health();
    expect(proving.status).toBe("ok");
    expect(proving.adapters.live.production).toBe(true);
    expect(health.offchainWorker.protocolBoundary.educational).toBe(true);
    const policy = await caller.readability.policy();
    expect(policy.requiredFields).toContain("transactionHash");
    const worker = await caller.readability.workerHealth();
    expect(worker.store.jobs).toBe(0);
  });

  it("submits a focused preview event", async () => {
    const caller = appRouter.createCaller(createContext());
    const receipt = await caller.readability.submitPreview({
      query: fixtureReadabilityQuery(),
      event: fixtureSourceEvent(),
    });
    expect(receipt.verified).toBe(true);
    expect(receipt.educational).toBe(true);
    expect(receipt.receiptStatus).toBe(1);
  });

  it("runs a focused event through the durable offchain worker", async () => {
    const caller = appRouter.createCaller(createContext());
    const result = await caller.readability.ingestDurablePreview({
      query: fixtureReadabilityQuery(),
      event: fixtureSourceEvent({ logIndex: 7 }),
    });
    expect(result.job?.phase).toBe("confirmed");
    expect(result.ingested.accepted).toBe(1);
  });

  it("rejects a generic Transfer preview through tRPC", async () => {
    const caller = appRouter.createCaller(createContext());
    await expect(
      caller.readability.submitPreview({
        query: fixtureReadabilityQuery({ eventName: "Transfer" }),
        event: fixtureSourceEvent({ eventName: "Transfer" }),
      }),
    ).rejects.toThrow(/EVENT_POLICY|generic source event/i);
  });

  it("estimates readability gas from the official continuity model", async () => {
    const caller = appRouter.createCaller(createContext());
    const estimate = await caller.readability.estimateGas({
      continuityHashCount: 10,
      merkleSiblingCount: 1,
      encodedTransactionBytes: 1000,
    });
    expect(estimate.officialCtc).toBeCloseTo(2.3e-5 + 2.9e-6, 12);
    expect(estimate.safe).toBe(true);
    const decision = await caller.readability.optimizeGas({
      continuityHashCount: 10,
      merkleSiblingCount: 1,
      encodedTransactionBytes: 1000,
      eventBlock: 100,
      attestedBlock: 110,
    });
    expect(decision.action).toBe("submit-now");
    const comparison = await caller.readability.compareGas({
      continuityNow: 10,
      continuityLater: 1010,
    });
    expect(comparison.officialMultiplier).toBeGreaterThan(1);
    const policy = await caller.readability.gasPolicy();
    expect(policy.maxTransactionBytes).toBe(500_000);
    expect(policy.workerEnforcement).toBe(false);
  });
});

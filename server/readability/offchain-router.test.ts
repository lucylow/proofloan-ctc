import { beforeEach, describe, expect, it } from "vitest";
import { readabilityRouter } from "./router";
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

describe("durable worker tRPC procedures", () => {
  beforeEach(() => {
    resetReadabilityRuntime();
  });

  it("exposes worker health on readability.health", async () => {
    const caller = readabilityRouter.createCaller(createContext());
    const health = await caller.health();
    expect(health.offchainWorker.protocolBoundary.educational).toBe(true);
    const worker = await caller.workerHealth();
    expect(worker.store.jobs).toBe(0);
  });

  it("confirms a focused durable preview job", async () => {
    const caller = readabilityRouter.createCaller(createContext());
    const result = await caller.ingestDurablePreview({
      query: fixtureReadabilityQuery(),
      event: fixtureSourceEvent({ logIndex: 7 }),
    });
    expect(result.job?.phase).toBe("confirmed");
    expect(result.ingested.accepted).toBe(1);
  });

  it("rejects Transfer on the durable ingest path", async () => {
    const caller = readabilityRouter.createCaller(createContext());
    await expect(
      caller.ingestDurablePreview({
        query: fixtureReadabilityQuery({ eventName: "Transfer" }),
        event: fixtureSourceEvent({ eventName: "Transfer" }),
      }),
    ).rejects.toThrow(/EVENT_POLICY|generic/i);
  });
});

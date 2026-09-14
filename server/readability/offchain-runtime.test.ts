import { beforeEach, describe, expect, it } from "vitest";
import { OffchainWorkerRuntime } from "./offchain-runtime";
import { fixtureReadabilityQuery, fixtureSourceEvent, READABILITY_DEMO_CONTRACT } from "./fixtures";
import { MemoryRpcSource, sourceChainFromLog, sourceLogFromEvent } from "./offchain-adapters";
import { ReadabilityError } from "./errors";

describe("durable offchain readability worker", () => {
  let runtime: OffchainWorkerRuntime;

  beforeEach(() => {
    runtime = new OffchainWorkerRuntime();
  });

  it("confirms a focused preview event through attestation, proof, and ASC", async () => {
    const result = await runtime.ingestPreview(fixtureReadabilityQuery(), fixtureSourceEvent());
    expect(result.ingested.accepted).toBe(1);
    expect(result.job?.phase).toBe("confirmed");
    expect(result.health.metrics.discovered).toBe(1);
    expect(result.health.store.processed).toBe(1);
    expect(result.health.protocolBoundary.educational).toBe(true);
  });

  it("deduplicates the same source event", async () => {
    const query = fixtureReadabilityQuery();
    const event = fixtureSourceEvent();
    await runtime.ingestPreview(query, event);
    const second = await runtime.ingestPreview(query, event);
    expect(second.ingested.accepted).toBe(0);
    expect(second.health.metrics.deduplicated).toBeGreaterThan(0);
  });

  it("rejects generic Transfer triggers", async () => {
    await expect(
      runtime.ingestPreview(
        fixtureReadabilityQuery({ eventName: "Transfer" }),
        fixtureSourceEvent({ eventName: "Transfer" }),
      ),
    ).rejects.toMatchObject({ code: "EVENT_POLICY" });
  });

  it("discovers seeded source logs through the bounded backfill scanner", async () => {
    const event = fixtureSourceEvent({ logIndex: 4 });
    const log = sourceLogFromEvent(event, 1);
    const rpc = new MemoryRpcSource("test-sepolia", event.blockNumber + 40, [log]);
    const isolated = new OffchainWorkerRuntime({ rpcSources: [rpc] });
    const scanned = await isolated.discover({
      address: READABILITY_DEMO_CONTRACT,
      eventName: "CreditPositionOpened",
      chainId: "ethereum-sepolia",
    });
    expect(scanned.events).toBe(1);
    expect(scanned.accepted).toBe(1);
    await isolated.tick();
    const jobs = await isolated.jobs();
    expect(jobs[0]?.phase).toBe("confirmed");
  });

  it("rejects unofficial source-chain ids instead of defaulting to Sepolia", () => {
    const event = sourceLogFromEvent(fixtureSourceEvent());
    expect(sourceChainFromLog(event)).toBe("Ethereum Sepolia");
    expect(() => sourceChainFromLog({ ...event, chainId: "not-a-chain" })).toThrow(ReadabilityError);
    expect(() => sourceChainFromLog({ ...event, chainId: "not-a-chain" })).toThrow(/Unsupported readability source chain/);
  });
});

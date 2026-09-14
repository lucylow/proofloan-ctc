import { beforeEach, describe, expect, it } from "vitest";
import { ReplayGuard } from "./replay";
import { assertTransition, canTransition } from "./status-machine";
import { MemoryReadabilityStore } from "./memory-store";
import { assertEventPolicy, assertExplicitEventName, eventPolicySnapshot } from "./event-policy";
import { EventScanner, sortEvents, unprocessedEvents } from "./events";
import { assertFinal, isMature } from "./finality";
import { assertAttestationMatches } from "./attestation";
import { DeterministicProofBuilder } from "./proof-builder";
import { PreviewBlockProver, ReadabilityExecutor } from "./asc";
import { ReadabilityService } from "./service";
import { readabilityConfigFromEnv } from "./runtime";
import { fixtureReadabilityQuery, fixtureSourceEvent } from "./fixtures";
import { fingerprintEvent, compareEventOrder } from "./event-helpers";
import { ReadabilityError, normalizeReadabilityError, trpcCodeForReadabilityError } from "./errors";
import { PRODUCTION_READABILITY_BOUNDARIES } from "./preview-adapters";
import type { SourceChainAdapter } from "./types";
import { READABILITY_GAS_POLICY } from "./gas/constants";
import { assertReadabilityProofSafety } from "../transactionProving/bridge";

describe("readability primitives", () => {
  it("prevents replay", () => {
    const guard = new ReplayGuard();
    const key = guard.key({ chainKey: 1, blockHeight: 10, transactionIndex: 2, source: "0xabc" });
    expect(guard.claim(key)).toBe(true);
    expect(guard.claim(key)).toBe(false);
  });

  it("enforces lifecycle transitions", () => {
    expect(canTransition("created", "watching")).toBe(true);
    expect(canTransition("created", "delivered")).toBe(false);
    expect(() => assertTransition("created", "delivered")).toThrow(/Invalid readability transition/);
  });

  it("stores proof state", async () => {
    const store = new MemoryReadabilityStore();
    await store.putStatus("q1", "created");
    await store.putStatus("q1", "watching");
    await store.putStatus("q1", "awaiting-attestation");
    await store.putStatus("q1", "proof-building");
    await store.putStatus("q1", "proof-ready");
    expect(store.snapshot().statuses).toBe(1);
    expect(store.snapshot().journal.map(entry => entry.status)).toContain("proof-ready");
  });
});

describe("readability event policy", () => {
  it("rejects generic Transfer triggers", () => {
    expect(() => assertExplicitEventName("Transfer")).toThrow(/Generic source event/);
    expect(() =>
      assertEventPolicy(fixtureSourceEvent({ eventName: "Transfer" }), fixtureReadabilityQuery()),
    ).toThrow(ReadabilityError);
  });

  it("accepts focused PascalCase credit events with required fields", () => {
    expect(() => assertEventPolicy(fixtureSourceEvent(), fixtureReadabilityQuery())).not.toThrow();
    expect(eventPolicySnapshot().forbidden).toContain("Transfer");
    expect(eventPolicySnapshot().focused).toContain("CreditPositionOpened");
  });

  it("rejects a contract mismatch", () => {
    expect(() =>
      assertEventPolicy(
        fixtureSourceEvent(),
        fixtureReadabilityQuery({ sourceContract: "0x0000000000000000000000000000000000000001" }),
      ),
    ).toThrow(/focused source contract/);
  });
});

describe("readability scanning and finality", () => {
  it("orders and cursors logs deterministically", async () => {
    const later = fixtureSourceEvent({ logIndex: 4, transactionIndex: 3 });
    const earlier = fixtureSourceEvent({ logIndex: 1, transactionIndex: 1 });
    const adapter: SourceChainAdapter = {
      chainId: "ethereum-sepolia",
      getLatestBlock: async () => 8_441_040,
      getBlockHash: async () => later.blockHash,
      getLogs: async () => [later, earlier],
      getTransactionReceipt: async () => ({ status: 1, blockNumber: later.blockNumber }),
    };
    const scanner = new EventScanner(adapter);
    const first = await scanner.scan({
      address: earlier.contractAddress,
      eventName: earlier.eventName,
      fromBlock: earlier.blockNumber,
      toBlock: earlier.blockNumber,
    });
    expect(first.map(event => event.logIndex)).toEqual([1, 4]);
    scanner.setCursor({ blockNumber: earlier.blockNumber, transactionIndex: 1, logIndex: 1 });
    const rest = await scanner.scan({
      address: earlier.contractAddress,
      eventName: earlier.eventName,
      fromBlock: earlier.blockNumber,
      toBlock: earlier.blockNumber,
    });
    expect(rest.map(event => event.logIndex)).toEqual([4]);
  });

  it("filters already processed events without marking new ones", async () => {
    const store = new MemoryReadabilityStore();
    const event = fixtureSourceEvent();
    const key = `${event.chainId}:${event.blockNumber}:${event.transactionHash}:${event.logIndex}`;
    await store.markProcessedEvent(key);
    const fresh = await unprocessedEvents(store, [event, fixtureSourceEvent({ logIndex: 9 })]);
    expect(fresh).toHaveLength(1);
    expect(fresh[0]?.logIndex).toBe(9);
  });

  it("requires confirmation depth plus reorg buffer", () => {
    const event = fixtureSourceEvent({ blockNumber: 100, confirmations: 10 });
    expect(isMature(event, 109, { minConfirmations: 32, reorgBuffer: 2 })).toBe(false);
    expect(() => assertFinal(event, 109, { minConfirmations: 32, reorgBuffer: 2 })).toThrow(/confirmation/);
    expect(assertFinal(fixtureSourceEvent({ blockNumber: 100, confirmations: 40 }), 139, {
      minConfirmations: 32,
      reorgBuffer: 2,
    }).confirmations).toBe(40);
  });

  it("sorts events by block, transaction index, then log index", () => {
    const events = [
      fixtureSourceEvent({ blockNumber: 2, transactionIndex: 0, logIndex: 0 }),
      fixtureSourceEvent({ blockNumber: 1, transactionIndex: 9, logIndex: 0 }),
      fixtureSourceEvent({ blockNumber: 1, transactionIndex: 1, logIndex: 3 }),
    ];
    const sorted = sortEvents(events);
    expect(sorted.map(event => `${event.blockNumber}:${event.transactionIndex}:${event.logIndex}`)).toEqual([
      "1:1:3",
      "1:9:0",
      "2:0:0",
    ]);
    expect(compareEventOrder(sorted[0]!, sorted[1]!)).toBeLessThan(0);
  });
});

describe("readability preview pipeline", () => {
  let service: ReadabilityService;

  beforeEach(() => {
    service = new ReadabilityService(readabilityConfigFromEnv({ ATTESTCOIN_ENVIRONMENT: "cc3-testnet" }));
  });

  it("delivers a focused preview event through attestation, proofs, ASC, and receipt success", async () => {
    const receipt = await service.deliverPreview(fixtureReadabilityQuery(), fixtureSourceEvent());
    expect(receipt.verified).toBe(true);
    expect(receipt.receiptStatus).toBe(1);
    expect(receipt.adapter).toBe("preview");
    expect(receipt.educational).toBe(true);
    expect(receipt.merkleInclusion?.valid).toBe(true);
    expect(receipt.merkleInclusion?.educational).toBe(true);
    expect(receipt.merkleInclusion?.siblingCount).toBeGreaterThan(0);
    expect(receipt.merkleInclusion?.hashing).toBe("usc-keccak-domain-separated");
    expect(receipt.blockProver.toLowerCase()).toContain("fd2");
    expect(receipt.queryId.startsWith("rq_")).toBe(true);
    expect(await service.store.getStatus(receipt.queryId)).toBe("delivered");
  });

  it("rejects Transfer even on the preview path", async () => {
    await expect(
      service.deliverPreview(
        fixtureReadabilityQuery({ eventName: "Transfer" }),
        fixtureSourceEvent({ eventName: "Transfer" }),
      ),
    ).rejects.toMatchObject({ code: "EVENT_POLICY" });
  });

  it("rejects an expired query before proof construction", async () => {
    await expect(
      service.deliverPreview(
        fixtureReadabilityQuery({ deadline: new Date(Date.now() - 1_000).toISOString() }),
        fixtureSourceEvent(),
      ),
    ).rejects.toMatchObject({ code: "EXPIRED" });
  });

  it("replays a delivered event", async () => {
    const query = fixtureReadabilityQuery();
    const event = fixtureSourceEvent();
    await service.deliverPreview(query, event);
    await expect(service.deliverPreview(query, event)).rejects.toMatchObject({ code: "REPLAY" });
  });

  it("labels preview proofs as educational and keeps live adapters behind an explicit boundary", async () => {
    const proof = await new DeterministicProofBuilder().build(fixtureReadabilityQuery(), fixtureSourceEvent());
    expect(proof.adapter).toBe("preview");
    expect(proof.siblings?.length).toBeGreaterThan(0);
    expect(proof.merkleRoot).toBe(proof.proofRoot);
    expect(await new PreviewBlockProver().verify(proof)).toBe(true);
    const submitted = await new ReadabilityExecutor(new PreviewBlockProver()).submit(
      fixtureReadabilityQuery(),
      fixtureSourceEvent(),
      proof,
    );
    expect(submitted.receiptStatus).toBe(1);
    expect(PRODUCTION_READABILITY_BOUNDARIES.liveBlockProver).toMatch(/0x0000000000000000000000000000000000000FD2/i);
    expect(PRODUCTION_READABILITY_BOUNDARIES.previewProofBuilder).toMatch(/educational/i);
    expect(PRODUCTION_READABILITY_BOUNDARIES.previewBlockProver).toMatch(/keccak inclusion/i);
    expect(PRODUCTION_READABILITY_BOUNDARIES.previewMerkle).toMatch(/hashLeaf/i);
    expect(PRODUCTION_READABILITY_BOUNDARIES.gasPlanner).toMatch(/estimates and schedules/i);
  });

  it("fingerprints events stably", () => {
    const event = fixtureSourceEvent();
    expect(fingerprintEvent(event)).toBe(fingerprintEvent({ ...event, confirmations: 99 }));
    expect(fingerprintEvent(event)).not.toBe(fingerprintEvent({ ...event, logIndex: 8 }));
  });

  it("rejects attestation hash mismatch", () => {
    expect(() =>
      assertAttestationMatches(
        {
          chainKey: 1,
          sourceBlock: 8_441_000,
          sourceBlockHash: `0x${"00".repeat(32)}`,
          attestedAt: new Date().toISOString(),
          validUntil: new Date(Date.now() + 60_000).toISOString(),
        },
        fixtureSourceEvent(),
      ),
    ).toThrow(/block hash/);
  });
});

describe("readability proving bridge", () => {
  it("accepts a focused preview bundle and rejects a 500 KB overflow", async () => {
    const builder = new DeterministicProofBuilder();
    const bundle = await builder.build(fixtureReadabilityQuery(), fixtureSourceEvent());
    expect(assertReadabilityProofSafety(bundle).allowed).toBe(true);
    expect(() =>
      assertReadabilityProofSafety({
        ...bundle,
        encodedTransaction: `0x${"aa".repeat(500 * 1024 + 1)}`,
      }),
    ).toThrow(ReadabilityError);
  });
});

describe("gas-aware readability worker", () => {
  it("still delivers a focused preview when gas awareness is off", async () => {
    const service = new ReadabilityService(
      readabilityConfigFromEnv({ ATTESTCOIN_ENVIRONMENT: "cc3-testnet" }),
    );
    const oversized = `0x${"ab".repeat(READABILITY_GAS_POLICY.maxTransactionBytes + 1)}`;
    const receipt = await service.deliverPreview(
      fixtureReadabilityQuery(),
      fixtureSourceEvent({ data: oversized, logIndex: 9 }),
    );
    expect(receipt.verified).toBe(true);
  });

  it("rejects oversized payloads when ATTESTCOIN_GAS_AWARE=true", async () => {
    const service = new ReadabilityService(
      readabilityConfigFromEnv({
        ATTESTCOIN_ENVIRONMENT: "cc3-testnet",
        ATTESTCOIN_GAS_AWARE: "true",
      }),
    );
    const oversized = `0x${"ab".repeat(READABILITY_GAS_POLICY.maxTransactionBytes + 1)}`;
    await expect(
      service.deliverPreview(
        fixtureReadabilityQuery(),
        fixtureSourceEvent({ data: oversized, logIndex: 10 }),
      ),
    ).rejects.toMatchObject({ code: "GAS" });
  });

  it("defers high-continuity queries when gas awareness is on and the deadline is not urgent", async () => {
    const service = new ReadabilityService(
      readabilityConfigFromEnv({
        ATTESTCOIN_ENVIRONMENT: "cc3-testnet",
        ATTESTCOIN_GAS_AWARE: "true",
      }),
    );
    await expect(
      service.deliverPreview(
        fixtureReadabilityQuery(),
        fixtureSourceEvent({ confirmations: 1501, logIndex: 11 }),
      ),
    ).rejects.toMatchObject({ code: "GAS", retriable: true });
  });
});

describe("readability error handling", () => {
  it("rejects unofficial source chains as typed CHAIN errors", async () => {
    const service = new ReadabilityService(readabilityConfigFromEnv({ ATTESTCOIN_ENVIRONMENT: "cc3-testnet" }));
    await expect(
      service.deliverPreview(
        fixtureReadabilityQuery({ environment: "cc3-mainnet", sourceChain: "Ethereum Sepolia" }),
        fixtureSourceEvent({ logIndex: 12 }),
      ),
    ).rejects.toMatchObject({ code: "CHAIN" });
  });

  it("rejects malformed attestation timestamps instead of treating them as fresh", () => {
    expect(() =>
      assertAttestationMatches(
        {
          chainKey: 1,
          sourceBlock: 8_441_000,
          sourceBlockHash: fixtureSourceEvent().blockHash,
          attestedAt: "not-a-date",
          validUntil: "also-not-a-date",
        },
        fixtureSourceEvent(),
      ),
    ).toThrow(/timestamps are invalid/);
  });

  it("rejects malformed deadlines as validation errors", async () => {
    const service = new ReadabilityService(readabilityConfigFromEnv({ ATTESTCOIN_ENVIRONMENT: "cc3-testnet" }));
    await expect(
      service.deliverPreview(
        fixtureReadabilityQuery({ deadline: "soon" }),
        fixtureSourceEvent({ logIndex: 13 }),
      ),
    ).rejects.toMatchObject({ code: "VALIDATION" });
  });

  it("normalizes adapter timeouts to retriable readability errors", () => {
    const aborted = new Error("The operation was aborted.");
    aborted.name = "AbortError";
    const timeout = normalizeReadabilityError(aborted);
    expect(timeout.code).toBe("TIMEOUT");
    expect(timeout.retriable).toBe(true);
    expect(trpcCodeForReadabilityError(timeout)).toBe("TIMEOUT");
  });
});

import { beforeEach, describe, expect, it } from "vitest";
import { QueryPlanner } from "../query";
import { DeterministicMockProver } from "../mockProvider";
import { TransactionProvingOrchestrator } from "../orchestrator";
import { estimateContinuityCost } from "../cost";
import { classifyPayloadRisk, classifyProofRisk } from "../risk";
import { calculateMerkleRoot, deriveTransactionIndex, verifyMerkle } from "../merkle";
import { calculateContinuityDigest, verifyContinuity } from "../continuity";
import { canTransition } from "../state";
import { partitionTargets } from "../batch";
import { chooseCheckpoint } from "../planner";
import { evaluateFreshness } from "../freshness";
import { detectReorg, recover, retryableProofError } from "../recovery";
import { ProofDedupe } from "../dedupe";
import { BackpressureGate } from "../backpressure";
import { IdempotentSubmissionManager } from "../submission";
import { requireSuccessfulReceipt } from "../guards";
import { SafeDecoder } from "../decoder";
import { previewVerify } from "../adapters";
import { verifyOffchainEnvelope } from "../verifier";
import { transactionProvingService, resetTransactionProvingRuntime } from "../instance";
import { VECTOR_LEAVES, merkleVectorRoot, vector_01, vector_30 } from "./vectors";
import type { ProofEnvelope } from "../types";
import { TransactionProvingError } from "../errors";
import { MAX_BATCH_TARGETS } from "../constants";

const DEMO_TX = `0x${"11".repeat(32)}`;

describe("transaction proving", () => {
  beforeEach(() => {
    resetTransactionProvingRuntime();
  });

  it("creates deterministic queries", () => {
    const q = new QueryPlanner().create({ chainKey: 1, txHash: DEMO_TX }, 1_700_000_000_000);
    expect(q.requestId).toContain("pq_");
    expect(q.requestId).toContain("11111111");
    expect(q.maxTransactionBytes).toBe(500 * 1024);
  });

  it("rejects an invalid chainKey or txHash at query time", () => {
    expect(() => new QueryPlanner().create({ chainKey: -1, txHash: DEMO_TX })).toThrow(TransactionProvingError);
    expect(() => new QueryPlanner().create({ chainKey: 1, txHash: "0xabc" })).toThrow(/INVALID_TX_HASH/);
  });

  it("uses the four-phase proving flow", async () => {
    const orchestrator = new TransactionProvingOrchestrator(new DeterministicMockProver());
    const q = new QueryPlanner().create({ chainKey: 1, txHash: DEMO_TX });
    const proof = await orchestrator.build(q);
    expect(proof.target.txHash).toBe(q.target.txHash);
    expect(proof.continuityProof.hashCount).toBe(0);
    expect(proof.fingerprint).toHaveLength(64);
    const verification = previewVerify(proof);
    expect(verification.ok).toBe(true);
    expect(verification.educational).toBe(true);
    expect(verifyOffchainEnvelope(proof, "wrong-upper").continuityValid).toBe(false);
    const extraction = new SafeDecoder().decode(proof.transaction);
    requireSuccessfulReceipt(extraction);
    expect(extraction.status).toBe(1);
  });

  it("keeps the published cost model explicit", () => {
    expect(estimateContinuityCost(10)).toBeGreaterThan(estimateContinuityCost(0));
    expect(estimateContinuityCost(0)).toBeCloseTo(2.3e-5);
    expect(chooseCheckpoint(10, 0.0001)).toBe("submit");
    expect(chooseCheckpoint(50_000, 0.0001)).toBe("wait");
  });

  it("blocks oversized transactions", () => {
    const proof = { transaction: { byteLength: 600_000 }, continuityProof: { hashCount: 0 } } as ProofEnvelope;
    expect(classifyProofRisk(proof).allowed).toBe(false);
    expect(classifyPayloadRisk(600_000, 0).risk).toBe("blocked");
  });

  it("classifies long continuity as high risk without blocking", () => {
    const decision = classifyPayloadRisk(1_024, 12_000);
    expect(decision.allowed).toBe(true);
    expect(decision.risk).toBe("high");
    expect(decision.reasonCodes).toContain("LONG_CONTINUITY");
  });
});

describe("merkle and continuity helpers", () => {
  it("treats a leaf with no siblings as the root", () => {
    expect(verifyMerkle("leaf", { root: "leaf", siblings: [] })).toBe(true);
    expect(calculateMerkleRoot("leaf", [])).toBe("leaf");
  });

  it("derives the transaction index from sibling orientation", () => {
    expect(deriveTransactionIndex([])).toBe(0);
    expect(deriveTransactionIndex([{ hash: "a", position: "right" }])).toBe(0);
    expect(deriveTransactionIndex([{ hash: "a", position: "left" }])).toBe(1);
  });

  it("folds continuity roots into an upper digest", () => {
    const proof = {
      lowerEndpointDigest: "lower",
      roots: [],
      startBlock: 1n,
      endBlock: 1n,
      hashCount: 0,
    };
    expect(verifyContinuity(proof, "lower")).toBe(true);
    expect(calculateContinuityDigest("lower", [])).toBe("lower");
  });

  it("keeps 30 deterministic merkle vector leaves stable", () => {
    expect(VECTOR_LEAVES).toHaveLength(30);
    expect(vector_01()).toBe(merkleVectorRoot("leaf-01"));
    expect(vector_30()).toBe(merkleVectorRoot("leaf-30"));
    for (const leaf of VECTOR_LEAVES) {
      expect(merkleVectorRoot(leaf)).toBe(leaf);
    }
  });
});

describe("safety, lifecycle, and operations", () => {
  it("enforces the proof lifecycle", () => {
    expect(canTransition("queued", "awaiting_attestation")).toBe(true);
    expect(canTransition("ready", "verified")).toBe(false);
    expect(canTransition("submitted", "verified")).toBe(true);
    expect(canTransition("building", "failed")).toBe(true);
  });

  it("detects stale proofs, reorgs, and retryable errors", () => {
    expect(
      evaluateFreshness({
        targetBlock: 100n,
        attestationBlock: 90n,
        currentBlock: 120n,
        window: 2_000,
      }).reason,
    ).toBe("ATTESTATION_PRECEDES_TARGET");
    expect(detectReorg("0xaaa", "0xAAA")).toBe(false);
    expect(detectReorg("0xaaa", "0xbbb")).toBe(true);
    expect(retryableProofError(new Error("network timeout"))).toBe(true);
    expect(recover("stale proof").reason).toBe("refresh-attestation");
  });

  it("batches, backpressures, and dedupes", () => {
    const targets = Array.from({ length: 17 }, (_, i) => ({
      chainKey: 1,
      txHash: `0x${i.toString(16).padStart(64, "0")}`,
    }));
    expect(partitionTargets(targets)).toHaveLength(2);
    expect(partitionTargets(targets)[0]).toHaveLength(MAX_BATCH_TARGETS);
    const gate = new BackpressureGate(1);
    expect(gate.tryAcquire()).toBe(true);
    expect(gate.tryAcquire()).toBe(false);
    gate.release();
    const dedupe = new ProofDedupe();
    const key = dedupe.key(1, DEMO_TX);
    expect(dedupe.has(key)).toBe(false);
    dedupe.mark(key);
    expect(dedupe.has(key)).toBe(true);
  });

  it("submits ASC payloads idempotently", async () => {
    let calls = 0;
    const client = {
      async submit() {
        calls += 1;
        return { txHash: "0xsub" };
      },
    };
    const manager = new IdempotentSubmissionManager(client);
    const envelope = {
      fingerprint: "abc",
      requestId: "r1",
      target: { chainKey: 1, txHash: DEMO_TX },
    } as ProofEnvelope;
    const first = await manager.submit(envelope);
    const second = await manager.submit(envelope);
    expect(first.txHash).toBe(second.txHash);
    expect(calls).toBe(1);
  });

  it("runs the preview pipeline and then rejects a duplicate", async () => {
    const result = await transactionProvingService.provePreview({ chainKey: 1, txHash: DEMO_TX });
    expect(result.phase).toBe("extraction");
    expect(result.educational).toBe(true);
    expect(result.verification.ok).toBe(true);
    expect(result.extraction.status).toBe(1);
    await expect(transactionProvingService.provePreview({ chainKey: 1, txHash: DEMO_TX })).rejects.toThrow(/already been consumed/);
  });

  it("exposes health, pipeline, and the live adapter boundary", () => {
    const health = transactionProvingService.health();
    expect(health.status).toBe("ok");
    expect(health.pipeline).toEqual(["query", "proof-generation", "verification", "data-extraction"]);
    expect(health.adapters.preview.production).toBe(false);
    expect(health.adapters.live.production).toBe(true);
    expect(health.boundaries.liveBlockProver).toContain("0FD2");
  });
});

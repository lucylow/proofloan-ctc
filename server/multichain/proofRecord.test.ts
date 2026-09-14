import { afterEach, describe, expect, it } from "vitest";
import { AttestcoinError } from "../attestcoin/errors";
import { finalizeVerifiedProof } from "./proofRecord";
import { assertSuccessfulReceipt } from "./receipt";
import { assertSourceFinality } from "./finality";
import {
  FIXTURE_LIVE_TX_HASH,
  fixtureProofDeadline,
  fixtureProofMaterial,
  fixtureSourceObservation,
} from "./fixtures";
import { resetProofIdempotency, beginProofRequest, commitProofRequest } from "./idempotency";
import { canonicalRequestHash } from "./proofRecord";
import { SUCCESS_RECEIPT_HEX, SUCCESS_RECEIPT_STATUS } from "@shared/attestcoin";
import { BLOCK_PROVER_PRECOMPILE } from "@shared/multichain";

const NOW = Date.parse("2026-09-13T08:00:01.000Z");

function finalize(overrides: Partial<Parameters<typeof finalizeVerifiedProof>[0]> = {}) {
  const observed = fixtureSourceObservation();
  return finalizeVerifiedProof({
    requestId: "req_canonical_001",
    requestHash: canonicalRequestHash({
      environment: "cc3-testnet",
      sourceChain: "Ethereum Sepolia",
      chainKey: 1,
      txHash: FIXTURE_LIVE_TX_HASH,
    }),
    environment: "cc3-testnet",
    sourceChain: "Ethereum Sepolia",
    chainKey: 1,
    txHash: FIXTURE_LIVE_TX_HASH,
    observed,
    proofData: fixtureProofMaterial(),
    merkleAndContinuityVerified: true,
    verificationBlock: 7_000_040,
    computedTxIndex: 7,
    receiptStatus: SUCCESS_RECEIPT_STATUS,
    decoderContract: "0x731c345d79Fb8BbDC541f9DF3b6317585F849F9f",
    deadline: fixtureProofDeadline(NOW),
    nowMs: NOW,
    staleProofMaxAgeMs: 86_400_000,
    rejectStaleLiveProofs: true,
    ...overrides,
  });
}

describe("canonical Attestcoin proof finalization", () => {
  afterEach(() => {
    resetProofIdempotency();
  });

  it("requires Merkle + continuity verification, receipt 0x1, tx index, and proof root", () => {
    const record = finalize();
    expect(record.verificationStatus).toBe("verified");
    expect(record.receiptStatus).toBe(SUCCESS_RECEIPT_HEX);
    expect(record.txIndex).toBe(7);
    expect(record.blockProver).toBe(BLOCK_PROVER_PRECOMPILE);
    expect(record.chainKey).toBe(1);
    expect(record.merkleProofHash.startsWith("0x")).toBe(true);
    expect(record.continuityProofHash.startsWith("0x")).toBe(true);
    expect(record.proofRoot.startsWith("0x")).toBe(true);
    expect(record.freshness).toBe("Fresh");
    expect(record.confirmations).toBeGreaterThanOrEqual(record.confirmationDepth);
  });

  it("rejects a failed source receipt before business logic", () => {
    expect(() => finalize({ receiptStatus: 0 })).toThrow(AttestcoinError);
    try {
      finalize({ receiptStatus: 0 });
    } catch (error) {
      expect(error).toMatchObject({ kind: "RECEIPT_FAILED" });
    }
    expect(() => assertSuccessfulReceipt(0)).toThrow(/status == 0x1/);
  });

  it("rejects proofs that fail Block Prover verification", () => {
    expect(() => finalize({ merkleAndContinuityVerified: false })).toThrow(
      /0x0000000000000000000000000000000000000FD2/,
    );
  });

  it("rejects stale live proofs and unconfirmed source transactions", () => {
    try {
      finalize({
        proofData: fixtureProofMaterial({
          generatedAt: new Date("2026-08-01T00:00:00.000Z"),
        }),
      });
      throw new Error("expected stale rejection");
    } catch (error) {
      expect(error).toMatchObject({ kind: "STALE_PROOF" });
    }

    expect(() =>
      assertSourceFinality(
        fixtureSourceObservation({
          head: 6_421_890,
          blockNumber: 6_421_883,
          confirmationDepth: 32,
        }),
      ),
    ).toThrow(/confirmation/);
  });

  it("rejects requests that exceed the deadline", () => {
    try {
      finalize({ nowMs: NOW + 20_000 });
      throw new Error("expected timeout");
    } catch (error) {
      expect(error).toMatchObject({ kind: "TIMEOUT" });
    }
  });

  it("replays a committed request hash instead of generating a second proof", () => {
    const record = finalize();
    const requestHash = record.requestHash;
    beginProofRequest({ requestHash, requestId: record.requestId, nowMs: NOW });
    commitProofRequest(requestHash, record, NOW);
    const replayed = beginProofRequest({
      requestHash,
      requestId: "req_canonical_002",
      nowMs: NOW + 10,
    });
    expect(replayed.status).toBe("committed");
    if (replayed.status === "committed") {
      expect(replayed.record.proofRoot).toBe(record.proofRoot);
    }
  });
});

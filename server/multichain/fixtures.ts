import type { SourceObservation } from "./finality";
import type { ProofMaterial } from "./proofRecord";
import { createProofDeadline } from "./deadlines";
import { SUCCESS_RECEIPT_STATUS } from "@shared/attestcoin";

export const FIXTURE_LIVE_TX_HASH = `0x${"ab".repeat(32)}`;

export function fixtureSourceObservation(
  overrides: Partial<SourceObservation> = {},
): SourceObservation {
  const blockNumber = overrides.blockNumber ?? 6_421_883;
  const confirmationDepth = overrides.confirmationDepth ?? 32;
  const head = overrides.head ?? blockNumber + 40;
  return {
    hash: FIXTURE_LIVE_TX_HASH,
    blockNumber,
    head,
    confirmations: overrides.confirmations ?? head - blockNumber,
    confirmationDepth,
    staleAfterBlocks: overrides.staleAfterBlocks ?? 200_000,
    from: "0x1111111111111111111111111111111111111111",
    to: "0x2222222222222222222222222222222222222222",
    chain: "Ethereum Sepolia",
    ...overrides,
  };
}

export function fixtureProofMaterial(
  overrides: Partial<ProofMaterial> = {},
): ProofMaterial {
  return {
    chainKey: 1,
    headerNumber: 6_421_883,
    txIndex: 7,
    txHash: FIXTURE_LIVE_TX_HASH,
    txBytes: "0x02deadbeef",
    merkleProof: { index: 7, hashes: ["0xaaa"] },
    continuityProof: { siblings: ["0xbbb"] },
    generatedAt: new Date("2026-09-13T08:00:00.000Z"),
    ...overrides,
  };
}

export function fixtureProofDeadline(nowMs = Date.parse("2026-09-13T08:00:01.000Z")) {
  return createProofDeadline(15_000, nowMs);
}

export const FIXTURE_SUCCESS_RECEIPT = SUCCESS_RECEIPT_STATUS;

export function fixtureMerkleAndContinuity() {
  return {
    merkleProof: { index: 7, hashes: ["0xaaa"] },
    continuityProof: { siblings: ["0xbbb"] },
  };
}

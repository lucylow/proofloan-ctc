import type { MerkleInclusion, MerkleSibling, ProofBundle } from "@shared/readability";
import { hashInner, hashLeaf, MERKLE_HASHING } from "./hash";

export function foldSiblingPath(encodedTransaction: string, siblings: MerkleSibling[]): string {
  let current = hashLeaf(encodedTransaction);
  for (const sibling of siblings) {
    current = sibling.left ? hashInner(sibling.hash, current) : hashInner(current, sibling.hash);
  }
  return current;
}

export function verifyMerkleProof(
  encodedTransaction: string,
  siblings: MerkleSibling[],
  merkleRoot: string,
): boolean {
  return foldSiblingPath(encodedTransaction, siblings).toLowerCase() === merkleRoot.toLowerCase();
}

export function assessMerkleProof(input: {
  encodedTransaction: string;
  merkleRoot: string;
  siblings: MerkleSibling[];
  leafCount?: number;
  txIndex?: number;
  educational?: boolean;
}): MerkleInclusion {
  const computedRoot = foldSiblingPath(input.encodedTransaction, input.siblings);
  const valid = computedRoot.toLowerCase() === input.merkleRoot.toLowerCase();
  const expectedDepth =
    input.leafCount && input.leafCount > 0 ? Math.ceil(Math.log2(input.leafCount)) : input.siblings.length;
  const depthMismatch =
    input.leafCount != null && input.leafCount > 1 && input.siblings.length !== expectedDepth;
  return {
    valid: valid && !depthMismatch,
    educational: input.educational ?? true,
    hashing: MERKLE_HASHING,
    leafCount: input.leafCount,
    transactionIndex: input.txIndex,
    depth: input.siblings.length,
    siblingCount: input.siblings.length,
    merkleRoot: input.merkleRoot,
    computedRoot,
    reason: depthMismatch
      ? `Sibling depth ${input.siblings.length} does not match log2(${input.leafCount}) = ${expectedDepth}.`
      : valid
        ? "Encoded transaction is included under the claimed Merkle root."
        : "Sibling path does not reconstruct the claimed Merkle root.",
  };
}

export function assessPreviewMerkleInclusion(bundle: ProofBundle): MerkleInclusion {
  if (bundle.adapter === "live") {
    return {
      valid: true,
      educational: false,
      skipped: true,
      reason: "Live Merkle proofs are verified by Block Prover 0x0FD2, not the local preview walker.",
    };
  }
  if (!bundle.merkleRoot) {
    return {
      valid: false,
      educational: true,
      hashing: MERKLE_HASHING,
      reason: "Preview Merkle root is missing.",
    };
  }
  if (!bundle.siblings) {
    return {
      valid: false,
      educational: true,
      hashing: MERKLE_HASHING,
      merkleRoot: bundle.merkleRoot,
      reason: "Preview Merkle sibling path is missing.",
    };
  }
  return assessMerkleProof({
    encodedTransaction: bundle.encodedTransaction,
    merkleRoot: bundle.merkleRoot,
    siblings: bundle.siblings,
    leafCount: bundle.leafCount,
    txIndex: bundle.txIndex,
    educational: true,
  });
}

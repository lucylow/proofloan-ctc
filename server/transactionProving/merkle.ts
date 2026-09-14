import type { MerkleEntry, MerkleProof } from "./types";
import { sha256Hex } from "./hash";

export function calculateMerkleRoot(leaf: string, siblings: MerkleEntry[]): string {
  let acc = leaf;
  for (const sibling of siblings) {
    const left = sibling.position === "left" ? sibling.hash : acc;
    const right = sibling.position === "left" ? acc : sibling.hash;
    acc = sha256Hex(left + right);
  }
  return acc;
}

export function verifyMerkle(leaf: string, proof: MerkleProof): boolean {
  return calculateMerkleRoot(leaf, proof.siblings) === proof.root;
}

/**
 * Sibling-on-left means the current node is the right child, so that bit is 1.
 * This is local index derivation for planning/tests, not Block Prover consensus.
 */
export function deriveTransactionIndex(siblings: MerkleEntry[]): number {
  let index = 0;
  siblings.forEach((sibling, i) => {
    if (sibling.position === "left") index |= 1 << i;
  });
  return index;
}

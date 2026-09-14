import type { MockMerkleProof, MockProofRequest } from "../types";
import { hex } from "../utils";

export function createMockMerkleProofs(seed: string, proofs: MockProofRequest[]): MockMerkleProof[] {
  return proofs.map(proof => ({
    id: `mrk_${proof.id}`,
    proofRequestId: proof.id,
    root: proof.proofRoot ?? hex(`${seed}:merkle:${proof.id}`, 32),
    siblings: [hex(`${seed}:sib:a:${proof.id}`, 32), hex(`${seed}:sib:b:${proof.id}`, 32), hex(`${seed}:sib:c:${proof.id}`, 32)],
    leaf: proof.txHash,
    valid: proof.status === "verified" || proof.status === "proven",
  }));
}

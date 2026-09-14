import type { MockContinuityProof, MockProofRequest } from "../types";
import { hex } from "../utils";

export function createMockContinuityProofs(seed: string, proofs: MockProofRequest[]): MockContinuityProof[] {
  return proofs.map(proof => ({
    id: `cnt_${proof.id}`,
    proofRequestId: proof.id,
    lowerEndpointDigest: hex(`${seed}:cont:low:${proof.id}`, 32),
    roots: [hex(`${seed}:cont:r1:${proof.id}`, 32), hex(`${seed}:cont:r2:${proof.id}`, 32)],
    contiguous: proof.status !== "partial",
    valid: proof.status === "verified" || proof.status === "proven",
  }));
}

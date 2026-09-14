import type { MockAttestationRound, MockProofRequest } from "../types";

export function createMockAttestations(proofs: MockProofRequest[]): MockAttestationRound[] {
  return proofs.map((proof, index) => {
    const complete = proof.status === "verified" || proof.status === "proven";
    const signatures = proof.status === "partial" ? 2 : complete ? 5 : proof.status === "delayed" ? 1 : 4;
    const quorum = 4;
    return {
      id: `att_${proof.id}`,
      proofRequestId: proof.id,
      round: 10 + (index % 6),
      providers: 5,
      signatures,
      quorum,
      signatureWeight: signatures / 5,
      complete,
      status: complete ? "quorum" : signatures >= quorum ? "quorum" : "insufficient",
    };
  });
}

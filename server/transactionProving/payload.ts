import type { ProofEnvelope } from "./types";

export function canonicalProofPayload(envelope: ProofEnvelope): string {
  return JSON.stringify({
    chainKey: envelope.target.chainKey,
    txHash: envelope.target.txHash,
    tx: envelope.transaction.hex,
    root: envelope.merkleProof.root,
    continuity: envelope.continuityProof.roots,
  });
}

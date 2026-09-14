import { proofFingerprint } from "./hash";
import { TransactionProvingError } from "./errors";
import { validateEnvelope } from "./validation";
import type { ProofEnvelope } from "./types";

export function buildEnvelope(input: Omit<ProofEnvelope, "fingerprint">): ProofEnvelope {
  const envelope = { ...input, fingerprint: "" } as ProofEnvelope;
  const errors = validateEnvelope(envelope).filter(issue => issue.fatal);
  if (errors.length) {
    throw new TransactionProvingError("PROOF", errors.map(error => error.code).join(","));
  }
  envelope.fingerprint = proofFingerprint([
    String(envelope.target.chainKey),
    envelope.target.txHash,
    envelope.transaction.hex,
    envelope.merkleProof.root,
    envelope.continuityProof.lowerEndpointDigest,
    ...envelope.continuityProof.roots,
  ]);
  return envelope;
}

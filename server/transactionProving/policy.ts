import type { ProofEnvelope } from "./types";

export interface AcceptancePolicy {
  maxBytes: number;
  maxHashes: number;
}

export function accepts(envelope: ProofEnvelope, policy: AcceptancePolicy): boolean {
  return (
    envelope.transaction.byteLength <= policy.maxBytes &&
    envelope.continuityProof.hashCount <= policy.maxHashes
  );
}

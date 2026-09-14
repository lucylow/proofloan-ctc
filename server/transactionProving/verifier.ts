import type { ProofEnvelope } from "./types";
import { calculateMerkleRoot } from "./merkle";
import { calculateContinuityDigest } from "./continuity";
import { DEFAULT_MAX_TX_BYTES } from "./constants";
import { normalizeHex } from "./hash";
import type { VerificationReport } from "./types";

/**
 * Educational structural check. This is not the Creditcoin Block Prover.
 */
export function verifyOffchainEnvelope(
  envelope: ProofEnvelope,
  expectedUpperDigest: string,
): VerificationReport {
  const leaf = normalizeHex(envelope.transaction.txHash);
  const merkleValid = calculateMerkleRoot(leaf, envelope.merkleProof.siblings) === envelope.merkleProof.root;
  const continuityValid =
    calculateContinuityDigest(envelope.continuityProof.lowerEndpointDigest, envelope.continuityProof.roots) ===
    expectedUpperDigest;
  const transactionSizeValid = envelope.transaction.byteLength <= DEFAULT_MAX_TX_BYTES;
  return {
    merkleValid,
    continuityValid,
    transactionSizeValid,
    ok: merkleValid && continuityValid && transactionSizeValid,
    adapter: "preview",
    educational: true,
  };
}

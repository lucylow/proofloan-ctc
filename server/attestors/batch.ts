import type { AttestationCertificate, MerkleProofEnvelope, VerifiedCrossChainFact } from "@shared/attestors";
import { verifyReadProof } from "./readProof";

export type BatchRead = { certificate: AttestationCertificate; envelope: MerkleProofEnvelope };

export function verifyBatchReads(reads: BatchRead[], maxQueries = 10): VerifiedCrossChainFact[] {
  if (reads.length === 0) return [];
  if (reads.length > maxQueries) throw new Error(`Attestcoin batch verification supports at most ${maxQueries} queries in this application policy.`);
  const continuityDigests = new Set(reads.map(r => r.envelope.continuityProof.attestationDigest));
  if (continuityDigests.size !== 1) throw new Error("Batch reads must share a continuity proof root.");
  return reads.map(r => verifyReadProof(r.envelope, r.certificate));
}

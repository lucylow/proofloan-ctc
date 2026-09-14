import type { AttestationCertificate, MerkleProofEnvelope, VerifiedCrossChainFact } from "@shared/attestors";
import { randomUUID } from "node:crypto";
import { continuityDigest, verifyContinuityAgainstAttestation } from "./continuity";
import { sha256Hex } from "./hash";

export function verifyReadProof(
  envelope: MerkleProofEnvelope,
  certificate: AttestationCertificate,
): VerifiedCrossChainFact {
  if (envelope.sourceBlock !== certificate.sourceBlock) throw new Error("Read proof block does not match the Attestor certificate.");
  if (!verifyContinuityAgainstAttestation(envelope.continuityProof, certificate)) throw new Error("Continuity proof failed against Attestor certificate.");
  if (!envelope.txHash.startsWith("0x")) throw new Error("Invalid transaction hash.");
  if (!Array.isArray(envelope.merkleProof) || envelope.merkleProof.length === 0) throw new Error("Merkle proof is empty.");
  const proofRoot = sha256Hex({ txHash: envelope.txHash, sourceBlock: envelope.sourceBlock, merkleProof: envelope.merkleProof, continuity: continuityDigest(envelope.continuityProof) });
  return {
    factId: `fact_att_${randomUUID().replaceAll("-", "")}`,
    sourceChain: certificate.sourceChain,
    sourceBlock: certificate.sourceBlock,
    txHash: envelope.txHash,
    eventType: "TRANSACTION",
    verified: true,
    attestationCertificateId: certificate.certificateId,
    quorum: certificate.quorum,
    proofRoot,
    attestorCount: certificate.quorum.signerCount,
    verifiedAt: new Date().toISOString(),
  };
}

import type { AttestationCertificate, ContinuityProof } from "@shared/attestors";
import { sha256Hex } from "./hash";

export function buildContinuityProof(startBlock: number, endBlock: number, hashes: string[], attestationDigest: string): ContinuityProof {
  if (!Number.isInteger(startBlock) || !Number.isInteger(endBlock) || endBlock < startBlock) throw new Error("Invalid continuity block range.");
  if (hashes.length !== endBlock - startBlock + 1) throw new Error("Continuity proof must include every block in the requested range.");
  let verified = true;
  for (let i = 1; i < hashes.length; i += 1) {
    if (!hashes[i] || !hashes[i - 1]) verified = false;
  }
  if (!attestationDigest.startsWith("0x")) verified = false;
  return { startBlock, endBlock, blockHashes: [...hashes], attestationDigest, verified };
}

export function continuityDigest(proof: ContinuityProof): string {
  return sha256Hex(proof);
}

export function verifyContinuityAgainstAttestation(proof: ContinuityProof, certificate: AttestationCertificate): boolean {
  if (!proof.verified) return false;
  if (proof.attestationDigest !== certificate.digest) return false;
  if (proof.endBlock < certificate.sourceBlock) return false;
  return proof.blockHashes[proof.endBlock - proof.startBlock] === certificate.blockHash;
}

import type { AttestorProfile, AttestorSignature } from "@shared/attestors";
import { isValidDigest, isValidPublicKey } from "./validation";

export function detectDuplicateSigners(signatures: AttestorSignature[]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const signature of signatures) {
    if (seen.has(signature.operatorId)) duplicates.add(signature.operatorId);
    seen.add(signature.operatorId);
  }
  return [...duplicates];
}

export function detectForeignSigners(signatures: AttestorSignature[], eligible: AttestorProfile[]): string[] {
  const allowed = new Set(eligible.map(p => p.operatorId));
  return [...new Set(signatures.map(s => s.operatorId).filter(id => !allowed.has(id)))];
}

export function detectMalformedSignatures(signatures: AttestorSignature[]): string[] {
  return signatures.filter(s => !isValidDigest(s.signedDigest) || !isValidPublicKey(s.publicKey) || !s.signature.startsWith("0x")).map(s => s.operatorId);
}

export function securityCheckSignatures(signatures: AttestorSignature[], eligible: AttestorProfile[]): { safe: boolean; duplicateSigners: string[]; foreignSigners: string[]; malformedSigners: string[] } {
  const duplicateSigners = detectDuplicateSigners(signatures);
  const foreignSigners = detectForeignSigners(signatures, eligible);
  const malformedSigners = detectMalformedSignatures(signatures);
  return { safe: duplicateSigners.length === 0 && foreignSigners.length === 0 && malformedSigners.length === 0, duplicateSigners, foreignSigners, malformedSigners };
}

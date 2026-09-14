import type { AttestorProfile, AttestorSignature } from "@shared/attestors";
import { rankAttestors } from "./reputation";

export function chooseSigners(profiles: AttestorProfile[], minimumCount = 2): AttestorProfile[] {
  const rankedIds = rankAttestors(profiles).slice(0, Math.max(minimumCount, profiles.length)).map(score => score.operatorId);
  const map = new Map(profiles.map(p => [p.operatorId, p]));
  return rankedIds.map(id => map.get(id)).filter((p): p is AttestorProfile => Boolean(p));
}

export function filterUniqueSignatures(signatures: AttestorSignature[]): AttestorSignature[] {
  const seen = new Set<string>();
  const output: AttestorSignature[] = [];
  for (const signature of signatures) {
    if (seen.has(signature.operatorId)) continue;
    seen.add(signature.operatorId);
    output.push({ ...signature });
  }
  return output;
}

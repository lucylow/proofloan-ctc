import type { AttestorProfile } from "@shared/attestors";

export function weightedSignerSet(profiles: AttestorProfile[], signerIds: string[]): { weightBps: number; signers: string[]; thresholdMet: boolean } {
  const unique = [...new Set(signerIds)];
  const weight = profiles.filter(p => unique.includes(p.operatorId) && (p.status === "active" || p.status === "probation")).reduce((sum, p) => sum + p.weightBps, 0);
  return { weightBps: weight, signers: unique, thresholdMet: weight >= 6667 };
}

export function minimumAdditionalWeight(profiles: AttestorProfile[], signerIds: string[], threshold = 6667): number {
  const current = weightedSignerSet(profiles, signerIds).weightBps;
  if (current >= threshold) return 0;
  const candidates = profiles.filter(p => !signerIds.includes(p.operatorId) && (p.status === "active" || p.status === "probation")).sort((a, b) => b.weightBps - a.weightBps);
  let added = 0;
  for (const candidate of candidates) { added += candidate.weightBps; if (current + added >= threshold) return added; }
  return Infinity;
}

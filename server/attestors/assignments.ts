import type { AttestorProfile } from "@shared/attestors";

export type AttestorAssignment = {
  operatorId: string;
  sourceChain: string;
  slot: number;
  weightBps: number;
  leaseId: string;
  assignedAt: string;
  expiresAt: string;
};

export function assignAttestors(profiles: AttestorProfile[], sourceChain: string, slotCount: number, leaseSeconds: number, now = new Date()): AttestorAssignment[] {
  const candidates = profiles
    .filter(p => p.chains.includes(sourceChain) && (p.status === "active" || p.status === "probation"))
    .sort((a, b) => b.weightBps - a.weightBps || b.uptimeBps - a.uptimeBps || a.operatorId.localeCompare(b.operatorId));
  const count = Math.max(0, Math.min(slotCount, candidates.length));
  return candidates.slice(0, count).map((p, index) => ({
    operatorId: p.operatorId,
    sourceChain,
    slot: index,
    weightBps: p.weightBps,
    leaseId: `lease_${sourceChain}_${index}_${now.getTime()}`,
    assignedAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + Math.max(1, leaseSeconds) * 1000).toISOString(),
  }));
}

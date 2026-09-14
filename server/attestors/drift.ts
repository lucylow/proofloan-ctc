import type { AttestorProfile } from "@shared/attestors";

export type QuorumDrift = { previousWeightBps: number; currentWeightBps: number; deltaBps: number; severity: "none" | "warning" | "critical" };

export function quorumDrift(previous: AttestorProfile[], current: AttestorProfile[]): QuorumDrift {
  const prior = previous.filter(p => p.status === "active" || p.status === "probation").reduce((sum, p) => sum + p.weightBps, 0);
  const now = current.filter(p => p.status === "active" || p.status === "probation").reduce((sum, p) => sum + p.weightBps, 0);
  const delta = now - prior;
  const magnitude = Math.abs(delta);
  return { previousWeightBps: prior, currentWeightBps: now, deltaBps: delta, severity: magnitude >= 2500 ? "critical" : magnitude >= 1000 ? "warning" : "none" };
}

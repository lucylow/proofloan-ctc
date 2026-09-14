import type { AttestorProfile } from "@shared/attestors";
import { rankAttestors } from "./reputation";

export function routeVerificationWork(profiles: AttestorProfile[], sourceChain: string): AttestorProfile[] {
  const candidates = profiles.filter(p => p.chains.includes(sourceChain) && (p.status === "active" || p.status === "probation"));
  const ranked = rankAttestors(candidates);
  const map = new Map(candidates.map(p => [p.operatorId, p]));
  return ranked.map(score => map.get(score.operatorId)).filter((p): p is AttestorProfile => Boolean(p));
}

export function routeMessageCarryingWork(profiles: AttestorProfile[], destinationChain: string): AttestorProfile[] {
  const candidates = profiles.filter(p => (p.status === "active" || p.status === "probation") && (p.chains.includes(destinationChain) || p.chains.length === 0));
  return candidates.sort((a, b) => b.uptimeBps - a.uptimeBps || b.weightBps - a.weightBps).map(p => ({ ...p }));
}

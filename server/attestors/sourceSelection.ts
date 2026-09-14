import type { AttestorProfile } from "@shared/attestors";

export type SourceSelection = { sourceChain: string; selected: string[]; reason: string };
export function selectSourceAttestors(profiles: AttestorProfile[], sourceChain: string, required = 5): SourceSelection { const candidates = profiles.filter(p => p.chains.includes(sourceChain) && (p.status === "active" || p.status === "probation")).sort((a, b) => b.uptimeBps - a.uptimeBps || b.weightBps - a.weightBps); const selected = candidates.slice(0, required).map(p => p.operatorId); return { sourceChain, selected, reason: selected.length >= required ? "capacity-satisfied" : "best-effort-capacity" }; }

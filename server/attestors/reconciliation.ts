import type { AttestorObservation, AttestorProfile } from "@shared/attestors";

export type ReconciliationReport = {
  sourceChain: string;
  sourceBlock: number;
  agreeingOperators: string[];
  disagreeingOperators: string[];
  missingOperators: string[];
  blockHashes: Record<string, string[]>;
  safe: boolean;
};

export function reconcileObservations(sourceChain: string, sourceBlock: number, profiles: AttestorProfile[], observations: AttestorObservation[]): ReconciliationReport {
  const relevant = observations.filter(o => o.sourceChain === sourceChain && o.sourceBlock === sourceBlock);
  const hashToOperators = new Map<string, string[]>();
  for (const observation of relevant) {
    const list = hashToOperators.get(observation.blockHash) ?? [];
    list.push(observation.operatorId);
    hashToOperators.set(observation.blockHash, list);
  }
  const canonical = [...hashToOperators.entries()].sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]))[0];
  const canonicalHash = canonical?.[0];
  const agreeingOperators = canonical?.[1] ?? [];
  const observedIds = new Set(relevant.map(o => o.operatorId));
  const eligibleIds = profiles.filter(p => p.status === "active" || p.status === "probation").map(p => p.operatorId);
  const disagreeingOperators = relevant.filter(o => o.blockHash !== canonicalHash).map(o => o.operatorId);
  const missingOperators = eligibleIds.filter(id => !observedIds.has(id));
  const blockHashes = Object.fromEntries([...hashToOperators.entries()].map(([hash, ids]) => [hash, [...ids]]));
  const agreeingWeight = profiles.filter(p => agreeingOperators.includes(p.operatorId)).reduce((sum, p) => sum + p.weightBps, 0);
  return { sourceChain, sourceBlock, agreeingOperators, disagreeingOperators, missingOperators, blockHashes, safe: Boolean(canonicalHash) && agreeingWeight >= 6667 };
}

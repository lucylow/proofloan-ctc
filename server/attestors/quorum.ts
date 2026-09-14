import type { AttestorProfile, AttestorQuorum, AttestorSignature } from "@shared/attestors";
import { validateQuorum } from "./validation";

export const DEFAULT_SUPERMAJORITY_BPS = 6_667;

export function calculateQuorum(
  eligible: AttestorProfile[],
  signatures: AttestorSignature[],
  requiredBps = DEFAULT_SUPERMAJORITY_BPS,
): AttestorQuorum {
  if (requiredBps <= 5_000 || requiredBps > 10_000) throw new Error("Required Attestor quorum must be >50% and <=100%.");
  const eligibleIds = new Set(eligible.filter(p => p.status === "active" || p.status === "probation").map(p => p.operatorId));
  const uniqueSigners = [...new Set(signatures.map(s => s.operatorId))].filter(id => eligibleIds.has(id));
  const totalEligibleWeightBps = eligible.filter(p => eligibleIds.has(p.operatorId)).reduce((sum, p) => sum + p.weightBps, 0);
  const observedWeightBps = eligible.filter(p => uniqueSigners.includes(p.operatorId)).reduce((sum, p) => sum + p.weightBps, 0);
  const quorum: AttestorQuorum = {
    requiredBps,
    observedWeightBps,
    signerCount: uniqueSigners.length,
    totalEligibleWeightBps,
    supermajority: observedWeightBps >= requiredBps,
  };
  validateQuorum(quorum);
  return quorum;
}

export function assertSupermajority(quorum: AttestorQuorum): void {
  validateQuorum(quorum);
  if (!quorum.supermajority) {
    throw new Error(`Attestor supermajority unavailable: ${quorum.observedWeightBps}/${quorum.totalEligibleWeightBps} bps, required ${quorum.requiredBps}.`);
  }
}

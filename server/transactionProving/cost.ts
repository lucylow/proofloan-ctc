import { BASE_COST_CTC, CONTINUITY_HASH_COST_CTC } from "./constants";
import type { ContinuityProof, ProofEnvelope } from "./types";

export function estimateContinuityCost(hashCount: number): number {
  return BASE_COST_CTC + CONTINUITY_HASH_COST_CTC * Math.max(0, hashCount);
}

export function estimateProofCost(envelope: ProofEnvelope): number {
  return estimateContinuityCost(envelope.continuityProof.hashCount);
}

export function continuitySavings(oldCount: number, newCount: number): number {
  return Math.max(0, estimateContinuityCost(oldCount) - estimateContinuityCost(newCount));
}

export function isCostEfficient(proof: ContinuityProof, budgetCtc: number): boolean {
  return estimateContinuityCost(proof.hashCount) <= budgetCtc;
}

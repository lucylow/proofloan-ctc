import { READABILITY_GAS_POLICY } from "./constants";

export type ContinuityPlan = {
  checkpointAgeBlocks: number;
  estimatedHashes: number;
  recommendation: "submit-now" | "wait" | "already-efficient";
};

export function estimateContinuityHashes(eventBlock: number, attestedBlock: number): number {
  if (!Number.isSafeInteger(eventBlock) || !Number.isSafeInteger(attestedBlock)) return 0;
  return Math.max(0, attestedBlock - eventBlock);
}

/**
 * Prefer proofs taken soon after finalization. Waiting on an already-old
 * checkpoint only lengthens the continuity proof.
 */
export function planContinuity(
  eventBlock: number,
  attestedBlock: number,
  recentWindow = READABILITY_GAS_POLICY.recentCheckpointWindowBlocks,
): ContinuityPlan {
  const hashes = estimateContinuityHashes(eventBlock, attestedBlock);
  if (hashes <= recentWindow) {
    return { checkpointAgeBlocks: hashes, estimatedHashes: hashes, recommendation: "already-efficient" };
  }
  if (hashes >= READABILITY_GAS_POLICY.targetContinuityHashes * 5) {
    return { checkpointAgeBlocks: hashes, estimatedHashes: hashes, recommendation: "submit-now" };
  }
  return {
    checkpointAgeBlocks: hashes,
    estimatedHashes: hashes,
    recommendation: hashes > READABILITY_GAS_POLICY.targetContinuityHashes ? "submit-now" : "wait",
  };
}

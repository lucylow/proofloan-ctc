import { READABILITY_GAS_POLICY } from "./constants";
import type { GasEstimate, GasRisk } from "./models";

export function classifyGasRisk(estimate: GasEstimate): GasRisk {
  if (!estimate.safe) return "blocked";
  if (estimate.continuityHashCount >= READABILITY_GAS_POLICY.highContinuityHashes) return "high";
  if (
    estimate.continuityHashCount >= READABILITY_GAS_POLICY.warningContinuityHashes ||
    estimate.transactionBytes > 250_000
  ) {
    return "medium";
  }
  return "low";
}

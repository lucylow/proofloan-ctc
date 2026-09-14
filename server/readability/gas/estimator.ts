import { GAS_POLICY_VERSION, READABILITY_GAS_POLICY } from "./constants";
import type { GasCostModel, GasEstimate, GasEstimateInput } from "./models";

export const DEFAULT_MODEL: GasCostModel = {
  baseCtc: READABILITY_GAS_POLICY.baseCtc,
  continuityHashCtc: READABILITY_GAS_POLICY.continuityHashCtc,
  maximalDecodeCtc: READABILITY_GAS_POLICY.maximalDecodeCtc,
  maxTransactionBytes: READABILITY_GAS_POLICY.maxTransactionBytes,
};

function clampNonNegative(n: number): number {
  return Number.isFinite(n) ? Math.max(0, n) : 0;
}

export function estimateReadabilityGas(
  input: GasEstimateInput,
  model: GasCostModel = DEFAULT_MODEL,
): GasEstimate {
  const continuity = Math.floor(clampNonNegative(input.continuityHashCount));
  const siblings = Math.floor(clampNonNegative(input.merkleSiblingCount));
  const bytes = Math.floor(clampNonNegative(input.encodedTransactionBytes));
  const continuityCtc = model.continuityHashCtc * continuity;
  const officialCtc = model.baseCtc + continuityCtc;
  // Internal heuristics only — not part of the official Attestcoin CTC equation.
  const merkleComplexityCtc = siblings * model.continuityHashCtc * 0.15;
  const normalizedBytes = Math.min(bytes, model.maxTransactionBytes);
  const byteRatio = model.maxTransactionBytes ? normalizedBytes / model.maxTransactionBytes : 0;
  const decodeRiskCtc = byteRatio * model.maximalDecodeCtc * 0.15;
  const estimatedCtc = officialCtc + merkleComplexityCtc + decodeRiskCtc;
  const reasons: string[] = [];
  if (bytes > model.maxTransactionBytes) {
    reasons.push("encoded transaction exceeds documented 500 KB provability guard");
  }
  if (continuity >= READABILITY_GAS_POLICY.highContinuityHashes) {
    reasons.push("continuity proof is in the high-cost historical range");
  } else if (continuity >= READABILITY_GAS_POLICY.warningContinuityHashes) {
    reasons.push("continuity proof is long enough to materially increase compute cost");
  }
  if (bytes > 250_000) {
    reasons.push("large transaction payload increases decoding risk");
  }
  return {
    modelVersion: GAS_POLICY_VERSION,
    officialCtc,
    estimatedCtc,
    continuityCtc,
    baseCtc: model.baseCtc,
    merkleComplexityCtc,
    decodeRiskCtc,
    transactionBytes: bytes,
    continuityHashCount: continuity,
    merkleSiblingCount: siblings,
    safe: bytes <= model.maxTransactionBytes,
    reasons,
  };
}

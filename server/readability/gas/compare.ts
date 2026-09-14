import { estimateReadabilityGas } from "./estimator";
import type { GasEstimate } from "./models";

export function compareTiming(continuityNow: number, continuityLater: number) {
  const now = estimateReadabilityGas({
    continuityHashCount: continuityNow,
    merkleSiblingCount: 10,
    encodedTransactionBytes: 1024,
  });
  const later = estimateReadabilityGas({
    continuityHashCount: continuityLater,
    merkleSiblingCount: 10,
    encodedTransactionBytes: 1024,
  });
  return {
    now,
    later,
    multiplier: later.estimatedCtc / Math.max(now.estimatedCtc, Number.EPSILON),
    officialMultiplier: later.officialCtc / Math.max(now.officialCtc, Number.EPSILON),
  };
}

export function compareEstimates(now: GasEstimate, later: GasEstimate) {
  return {
    now,
    later,
    multiplier: later.estimatedCtc / Math.max(now.estimatedCtc, Number.EPSILON),
    officialMultiplier: later.officialCtc / Math.max(now.officialCtc, Number.EPSILON),
    extraContinuityHashes: later.continuityHashCount - now.continuityHashCount,
  };
}

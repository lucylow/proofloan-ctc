import type { ReadabilityCostBudget } from "./models";

/**
 * Official Attestcoin readability cost model:
 * CTC Cost ≈ 2.3e-5 + 2.9e-7 × continuity hash count
 *
 * Merkle complexity and decode-risk additives used elsewhere in this layer
 * are internal planning heuristics, not official protocol gas equations.
 */
export const READABILITY_GAS_POLICY = Object.freeze({
  baseCtc: 2.3e-5,
  continuityHashCtc: 2.9e-7,
  maxTransactionBytes: 500_000,
  maximalDecodeCtc: 0.0375,
  recentCheckpointWindowBlocks: 100,
  warningContinuityHashes: 500,
  highContinuityHashes: 1000,
  targetContinuityHashes: 100,
  merkleHashBytes: 32,
  ctcDecimals: 18,
});

export const GAS_POLICY_VERSION = "attestcoin-readability-2026-09";

export const OFFICIAL_CTC_FORMULA = "2.3e-5 + 2.9e-7 × continuity hash count";

export const DEFAULT_COST_BUDGET: ReadabilityCostBudget = Object.freeze({
  perQueryCtc: 0.01,
  perMinuteCtc: 0.05,
  perHourCtc: 0.5,
  maxOutstandingQueries: 32,
});

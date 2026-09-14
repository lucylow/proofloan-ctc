import { READABILITY_GAS_POLICY } from "../readability/gas/constants";

/** Documented 500 KB encoded-transaction proving guard. */
export const DEFAULT_MAX_TX_BYTES = 500 * 1024;
export const DEFAULT_MAX_CONTINUITY_HASHES = 50_000;
export const DEFAULT_FRESHNESS_WINDOW_BLOCKS = 2_000;
export const DEFAULT_REQUEST_DEADLINE_MS = 10 * 60_000;
export const DEFAULT_MAX_MERKLE_SIBLINGS = 32;

/** Official Attestcoin continuity-based CTC estimate, reused from the readability gas layer. */
export const BASE_COST_CTC = READABILITY_GAS_POLICY.baseCtc;
export const CONTINUITY_HASH_COST_CTC = READABILITY_GAS_POLICY.continuityHashCtc;
export const MAX_REASONABLE_GAS_CTC = 0.05;
export const MAX_BATCH_TARGETS = 16;
export const HIGH_COST_CTC = 0.01;
export const LARGE_TRANSACTION_BYTES = 250_000;
export const LONG_CONTINUITY_HASHES = 10_000;

export const PROOF_BUILDER_PREVIEW_VERSION = "adapter:preview";
export const PROOF_BUILDER_LIVE_VERSION = "adapter:live:@gluwa/usc-sdk";

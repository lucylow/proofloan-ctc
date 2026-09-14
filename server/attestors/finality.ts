export type FinalityPolicy = { minConfirmations: number; maxReorgDepth: number };
export const defaultFinalityPolicy: FinalityPolicy = { minConfirmations: 12, maxReorgDepth: 2 };

export function isSourceBlockFinalized(blockNumber: number, latestBlock: number, policy = defaultFinalityPolicy): boolean { return latestBlock - blockNumber >= policy.minConfirmations; }
export function isReorgSafe(depth: number, policy = defaultFinalityPolicy): boolean { return depth <= policy.maxReorgDepth; }

export type RecentFinalizationPolicy = {
  maxAgeBlocks: number;
  minimumSavingsRatio: number;
};

export function shouldPreferRecentFinalization(
  continuityHashes: number,
  policy: RecentFinalizationPolicy = { maxAgeBlocks: 100, minimumSavingsRatio: 0.1 },
): boolean {
  if (continuityHashes <= policy.maxAgeBlocks) return false;
  return continuityHashes / Math.max(1, policy.maxAgeBlocks) >= 1 + policy.minimumSavingsRatio;
}

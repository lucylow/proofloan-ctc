import type { BlockchainObservation } from './blockchainTypes';
export function crossChainConsistency(observations: BlockchainObservation[]): number {
  const byChain = new Map<string, number>();
  for (const o of observations) byChain.set(o.chainId, (byChain.get(o.chainId) ?? 0) + 1);
  if (byChain.size < 2) return 0.5;
  const counts = [...byChain.values()];
  const max = Math.max(...counts), min = Math.min(...counts);
  return max === 0 ? 0 : Math.min(1, min / max);
}

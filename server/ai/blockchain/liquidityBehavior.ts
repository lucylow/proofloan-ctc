import type { BlockchainObservation } from './blockchainTypes';
export function liquiditySignal(observations: BlockchainObservation[]): number {
  if (!observations.length) return 0;
  const large = observations.filter(o => Number(o.amount) > 10000).length;
  return Math.min(1, large / Math.max(5, observations.length / 2));
}

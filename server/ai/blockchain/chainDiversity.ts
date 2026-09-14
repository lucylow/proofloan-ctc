import type { BlockchainObservation } from './blockchainTypes';
export function chainDiversity(observations: BlockchainObservation[]): number {
  const chains = new Set(observations.map(o => o.chainId));
  return Math.min(1, chains.size / 5);
}

import type { BlockchainObservation } from './blockchainTypes';
export function counterpartyDiversity(observations: BlockchainObservation[]): number {
  const unique = new Set(observations.map(o => o.address?.toLowerCase()).filter((address): address is string => Boolean(address)));
  if (unique.size === 0) return 0;
  return Math.min(1, unique.size / Math.max(10, observations.length));
}

import type { BlockchainObservation, VerifiedChainEvent } from './blockchainTypes';
export function evidenceDensity(observations: BlockchainObservation[], events: VerifiedChainEvent[]): number {
  const count = observations.length + events.length;
  return Math.min(1, count / 100);
}

import type { BlockchainObservation, VerifiedChainEvent } from './blockchainTypes';
export function proofCoverage(observations: BlockchainObservation[], events: VerifiedChainEvent[]): number {
  const all = observations.length + events.length;
  if (!all) return 0;
  const verified = observations.filter(o => o.verified).length + events.filter(e => e.verified).length;
  return verified / all;
}

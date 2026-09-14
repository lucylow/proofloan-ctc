import type { VerifiedChainEvent } from './blockchainTypes';
export function uniqueContracts(events: VerifiedChainEvent[]): number {
  return new Set(events.map(e => e.address?.toLowerCase()).filter((address): address is string => Boolean(address))).size;
}

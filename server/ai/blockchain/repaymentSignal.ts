import type { VerifiedChainEvent } from './blockchainTypes';
export function repaymentSignal(events: VerifiedChainEvent[]): number {
  const repayments = events.filter(e => /repay|payment|settle/i.test(e.topic0)).length;
  return Math.min(1, repayments / 5);
}

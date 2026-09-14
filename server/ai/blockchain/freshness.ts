import type { BlockchainObservation, VerifiedChainEvent } from './blockchainTypes';
import { clamp01 } from './normalization';
export function freshnessScore(observations: BlockchainObservation[], events: VerifiedChainEvent[], nowMs: number, halfLifeMs = 86_400_000): number {
  const times = [...observations.map(o => o.timestampMs), ...events.map(e => e.timestampMs)];
  if (!times.length) return 0;
  const avgAge = times.reduce((s,t)=>s + Math.max(0, nowMs - t), 0) / times.length;
  return clamp01(Math.exp(-avgAge / Math.max(1, halfLifeMs)));
}

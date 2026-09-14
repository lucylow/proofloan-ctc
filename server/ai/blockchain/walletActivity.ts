import type { BlockchainObservation } from './blockchainTypes';
import { rollingWindow, withinWindow } from './windowing';

export function countWalletActivity(observations: BlockchainObservation[], nowMs: number, days: number): number {
  const w = rollingWindow(nowMs, days);
  return observations.filter(o => withinWindow(o.timestampMs, w)).length;
}

export function activeDays(observations: BlockchainObservation[], nowMs: number, days: number): number {
  const w = rollingWindow(nowMs, days);
  return new Set(observations.filter(o => withinWindow(o.timestampMs, w)).map(o => new Date(o.timestampMs).toISOString().slice(0,10))).size;
}

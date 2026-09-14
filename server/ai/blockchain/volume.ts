import type { BlockchainObservation } from './blockchainTypes';
import { safeNumber } from './normalization';
export function directionalVolume(observations: BlockchainObservation[]) {
  let inbound = 0, outbound = 0;
  for (const o of observations) {
    const amount = Math.max(0, safeNumber(o.amount));
    if (o.direction === 'in') inbound += amount;
    if (o.direction === 'out') outbound += amount;
  }
  return { inbound, outbound, net: inbound - outbound };
}

import { createHash } from 'node:crypto';
import type { AIBlockchainFeatures } from './featureTypes';
export function blockchainFeatureFingerprint(features: AIBlockchainFeatures): string {
  const normalized = JSON.stringify(Object.keys(features).sort().map(k => [k, (features as any)[k]]));
  return createHash('sha256').update(normalized).digest('hex');
}

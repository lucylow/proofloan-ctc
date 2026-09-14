import type { AIBlockchainFeatures } from './featureTypes';
export function walletEmbedding(f: AIBlockchainFeatures): number[] {
  return [
    Math.tanh(f.walletAgeDays/365),
    Math.tanh(f.transactionCount30d/50),
    Math.tanh(f.transactionCount180d/500),
    f.counterpartyDiversity,
    f.proofCoverage,
    f.freshnessScore,
    f.crossChainConsistency,
    1-f.anomalyScore,
  ];
}

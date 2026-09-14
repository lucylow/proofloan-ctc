import type { AIBlockchainFeatures } from './featureTypes';
export function shadowBlockchainScore(f:AIBlockchainFeatures){ return 0.5*f.proofCoverage+0.2*f.freshnessScore+0.15*f.repaymentSignal+0.15*f.crossChainConsistency; }

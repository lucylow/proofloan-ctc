import type { AIBlockchainFeatures } from './featureTypes';
export function featureAttribution(f:AIBlockchainFeatures){ return [
 ['proofCoverage',f.proofCoverage],['freshnessScore',f.freshnessScore],['repaymentSignal',f.repaymentSignal],['crossChainConsistency',f.crossChainConsistency],['anomalyScore',f.anomalyScore]
 ] as Array<[string,number]>; }

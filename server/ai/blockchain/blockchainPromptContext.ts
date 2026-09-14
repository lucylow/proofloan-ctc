import type { AIBlockchainFeatures } from './featureTypes';
export function buildBlockchainPromptContext(f:AIBlockchainFeatures){ return {
 evidenceSummary:{proofCoverage:f.proofCoverage,freshness:f.freshnessScore,crossChainConsistency:f.crossChainConsistency},
 behavior:{repaymentSignal:f.repaymentSignal,volatilitySignal:f.volatilitySignal,liquiditySignal:f.liquiditySignal},
 instruction:'Treat verified blockchain evidence as observations, not as a guarantee of future behavior.'
}; }

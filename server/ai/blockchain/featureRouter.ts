import type { AIBlockchainFeatures } from './featureTypes';
export type FeatureRoute = 'fast'|'deep'|'abstain';
export function routeBlockchainFeatures(f:AIBlockchainFeatures):FeatureRoute{ if(f.proofCoverage<0.2)return 'abstain'; if(f.transactionCount180d>500||f.uniqueChains180d>2)return 'deep'; return 'fast'; }

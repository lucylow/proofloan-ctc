import type { AIBlockchainFeatures } from './featureTypes';
export function walletRisk(f:AIBlockchainFeatures){
 const risk=0.4*f.anomalyScore+0.25*f.volatilitySignal+0.2*(1-f.proofCoverage)+0.15*(1-f.freshnessScore);
 return Math.max(0,Math.min(1,risk));
}

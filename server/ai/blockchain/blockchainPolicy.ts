export interface BlockchainAIPolicy { allowUnverifiedFallback:boolean; minimumCoverage:number; minimumFreshness:number; maxAnomaly:number; }
export function enforceBlockchainPolicy(f:any,p:BlockchainAIPolicy){ if(f.proofCoverage<p.minimumCoverage)return false; if(f.freshnessScore<p.minimumFreshness)return false; if(f.anomalyScore>p.maxAnomaly)return false; return true; }

import type { AIBlockchainFeatures } from './featureTypes';
export interface ChainFeaturePolicy { chainId: string; weight: number; enabled: boolean; maxFreshnessMs: number; }
export class ChainFeatureRegistry {
  private policies = new Map<string, ChainFeaturePolicy>();
  register(policy: ChainFeaturePolicy) { this.policies.set(policy.chainId, policy); }
  get(chainId: string) { return this.policies.get(chainId); }
  weightedScore(chainIds: string[], scores: Map<string, number>): number {
    let sum=0, weight=0;
    for(const id of chainIds){ const p=this.policies.get(id); if(!p?.enabled) continue; const s=scores.get(id); if(s===undefined) continue; sum+=s*p.weight; weight+=p.weight; }
    return weight ? sum/weight : 0;
  }
}

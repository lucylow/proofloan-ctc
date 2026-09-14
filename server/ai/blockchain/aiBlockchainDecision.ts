import type { AIBlockchainFeatures } from './featureTypes';
import { scoreVerifiedBehavior } from './proofAwareScoring';
export interface BlockchainDecision { pdAdjustment:number; riskTier:'A'|'B'|'C'|'D'|'ABSTAIN'; reasons:string[]; }
export function blockchainDecision(f:AIBlockchainFeatures):BlockchainDecision{
 const s=scoreVerifiedBehavior(f); if(s.abstain)return {pdAdjustment:0,riskTier:'ABSTAIN',reasons:[...s.reasons,'INSUFFICIENT_VERIFIED_BLOCKCHAIN_EVIDENCE']};
 const adj=0.25*(1-s.score);
 const tier=s.score>0.8?'A':s.score>0.6?'B':s.score>0.4?'C':'D';
 return {pdAdjustment:adj,riskTier:tier,reasons:s.reasons};
}

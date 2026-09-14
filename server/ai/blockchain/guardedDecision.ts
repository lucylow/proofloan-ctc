import { riskTier } from './riskTier';
export function guardedDecision(input:{basePd:number; blockchainScore:number; confidence:number; proofCoverage:number}){ if(input.proofCoverage<0.2)return {riskTier:'ABSTAIN' as const,pd30:input.basePd}; const pd=Math.max(0,Math.min(1,input.basePd + (1-input.blockchainScore)*0.15*input.confidence)); return {pd30:pd,riskTier:riskTier(pd,input.confidence)}; }

import type { FeatureVector, VerifiedFact } from "@shared/proofloan";
const banned=["ignore previous","system prompt","reveal secrets","invent transaction","claim verified"];
export function sanitizeUserContext(value:string):string{return value.replace(/[^\x20-\x7E\n]/g,"").slice(0,4000);}
export function validateEvidenceNarrative(value:string):boolean{const n=value.toLowerCase(); return !banned.some(x=>n.includes(x));}
export function buildSafeModelContext(features:FeatureVector,facts:VerifiedFact[]){return {features,facts:facts.map(f=>({id:f.id,chain:f.chain,sourceBlock:f.sourceBlock,eventType:f.eventType,amount:f.amount,freshness:f.freshness,proofRoot:f.proofRoot}))};}

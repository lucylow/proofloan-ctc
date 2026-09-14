export interface SourceReliability { rpc:number; proof:number; attestor:number; }
export function sourceReliability(s:SourceReliability){ return Math.max(0,Math.min(1,0.25*s.rpc+0.45*s.proof+0.3*s.attestor)); }

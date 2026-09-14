export interface BlockSignal { txCount:number; gasUsed:number; gasLimit:number; timestampDeltaMs:number; }
export function blockRisk(s:BlockSignal){ const fullness=s.gasLimit? s.gasUsed/s.gasLimit:0; const timing=Math.max(0,Math.min(1,1-s.timestampDeltaMs/120000)); return Math.min(1,0.6*fullness+0.4*timing); }

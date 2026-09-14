export interface BacktestCase { expectedRisk:number; actualDefault:boolean; predictedRisk:number; }
export function brierScore(cases:BacktestCase[]){ if(!cases.length)return 0; return cases.reduce((s,c)=>s+(c.predictedRisk-(c.actualDefault?1:0))**2,0)/cases.length; }

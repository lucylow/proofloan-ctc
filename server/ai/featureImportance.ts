import type { FeatureVector } from "@shared/proofloan";
export function featureImportance(f:FeatureVector){const scores=Object.entries(f).map(([feature,value])=>({feature,value,score:Math.abs(Number(value))}));const total=scores.reduce((s,x)=>s+x.score,0)||1;return scores.map(x=>({...x,normalized:x.score/total})).sort((a,b)=>b.normalized-a.normalized);}

/** Oracle latency penalty. Deterministic, mock-safe blockchain AI feature. */
export interface OraclelatencyInput { values:number[]; verified?:boolean[]; }

export function oracleLatency(input:OraclelatencyInput):number {
  const values=input.values.filter(v=>Number.isFinite(v)).map(Number);
  if (!values.length) return 0;
  const mean=values.reduce((a,b)=>a+b,0)/values.length;
  const spread=values.reduce((s,v)=>s+Math.abs(v-mean),0)/values.length;
  const verification = input.verified && input.verified.length ? input.verified.filter(Boolean).length/input.verified.length : 1;
  return Math.max(0, Math.min(1, verification * (1 / (1 + Math.abs(mean) + spread))));
}

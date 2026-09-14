export function volatility(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((a,b)=>a+b,0)/values.length;
  const variance = values.reduce((s,v)=>s+(v-mean)**2,0)/values.length;
  return Math.sqrt(variance) / Math.max(1e-9, Math.abs(mean));
}

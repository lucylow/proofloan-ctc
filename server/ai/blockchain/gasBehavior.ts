export interface GasSample { gasUsed: number; gasPriceGwei: number; timestampMs: number; }
export function gasDiscipline(samples: GasSample[]): number {
  if (!samples.length) return 0;
  const sorted = samples.map(s => s.gasPriceGwei).sort((a,b)=>a-b);
  const median = sorted[Math.floor(sorted.length/2)] || 0;
  const deviations = sorted.map(v => median ? Math.abs(v-median)/median : 0);
  const avg = deviations.reduce((a,b)=>a+b,0)/deviations.length;
  return Math.max(0, Math.min(1, 1-avg));
}

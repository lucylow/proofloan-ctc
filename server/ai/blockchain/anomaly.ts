import { clamp01 } from './normalization';
export function anomalyScore(values: number[]): number {
  if (values.length < 3) return 0;
  const mean = values.reduce((a,b)=>a+b,0)/values.length;
  const sd = Math.sqrt(values.reduce((s,v)=>s+(v-mean)**2,0)/values.length) || 1;
  const z = values.map(v=>Math.abs((v-mean)/sd));
  const tail = z.filter(v=>v > 3).length / z.length;
  return clamp01(tail * 2);
}

export type OperatorMetric = { key: string; value: number; at: string; tags: Record<string,string> };

export class OperatorMetrics {
  private counters = new Map<string, number>();
  private gauges = new Map<string, number>();
  private timings = new Map<string, number[]>();

  increment(name: string, value = 1): void { this.counters.set(name, (this.counters.get(name) ?? 0) + value); }
  gauge(name: string, value: number): void { if (Number.isFinite(value)) this.gauges.set(name, value); }
  observe(name: string, ms: number): void { if (!Number.isFinite(ms) || ms < 0) return; const list = this.timings.get(name) ?? []; list.push(ms); if (list.length > 1000) list.shift(); this.timings.set(name, list); }
  snapshot(): { counters: Record<string,number>; gauges: Record<string,number>; timings: Record<string,{count:number;p50:number;p95:number;p99:number}> } {
    const timings: Record<string,{count:number;p50:number;p95:number;p99:number}> = {};
    for (const [name, values] of this.timings) { const s = [...values].sort((a,b)=>a-b); timings[name] = { count:s.length, p50:quantile(s,.5), p95:quantile(s,.95), p99:quantile(s,.99) }; }
    return { counters:Object.fromEntries(this.counters), gauges:Object.fromEntries(this.gauges), timings };
  }
}
function quantile(sorted:number[], q:number):number { if (!sorted.length) return 0; return sorted[Math.min(sorted.length-1, Math.max(0, Math.ceil(sorted.length*q)-1))] ?? 0; }
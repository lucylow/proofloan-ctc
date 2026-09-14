import { AI_MAX_LATENCY_SAMPLES } from "./constants";

export type LatencySample = { stage: string; ms: number };

export class LatencyTracker {
  private rows: LatencySample[] = [];
  add(stage: string, ms: number) {
    if (typeof stage !== "string" || stage.trim().length === 0 || !Number.isFinite(ms) || ms < 0) return;
    if (this.rows.length >= AI_MAX_LATENCY_SAMPLES) this.rows.shift();
    this.rows.push({ stage, ms });
  }
  summary() {
    const by = new Map<string, number[]>();
    for (const r of this.rows) {
      const a = by.get(r.stage) || [];
      a.push(r.ms);
      by.set(r.stage, a);
    }
    return Object.fromEntries([...by.entries()].map(([k, v]) => {
      const sorted = [...v].sort((a, b) => a - b);
      return [k, { p50: sorted[Math.floor(sorted.length * .5)] || 0, p95: sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * .95))] || 0, count: sorted.length }];
    }));
  }
}

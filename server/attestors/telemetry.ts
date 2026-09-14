import type { AttestorHealth } from "@shared/attestors";

export type AttestorTelemetryPoint = {
  at: string;
  healthyWeightBps: number;
  healthyCount: number;
  totalCount: number;
  averageLatencyMs: number;
};

export class AttestorTelemetry {
  private readonly points: AttestorTelemetryPoint[] = [];
  sample(health: AttestorHealth[], at = new Date()): AttestorTelemetryPoint {
    const healthy = health.filter(h => h.available);
    const point = {
      at: at.toISOString(),
      healthyWeightBps: healthy.reduce((sum, h) => sum + h.weightBps, 0),
      healthyCount: healthy.length,
      totalCount: health.length,
      averageLatencyMs: healthy.length === 0 ? 0 : Math.round(healthy.reduce((sum, h) => sum + h.latencyMs, 0) / healthy.length),
    };
    this.points.push(point);
    if (this.points.length > 10_000) this.points.splice(0, this.points.length - 10_000);
    return { ...point };
  }
  recent(limit = 100): AttestorTelemetryPoint[] { return this.points.slice(-Math.max(1, limit)).map(p => ({ ...p })); }
}

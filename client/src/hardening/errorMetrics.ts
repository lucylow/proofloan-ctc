import type { NormalizedAppError } from "./types";

export type ErrorMetric = {
  code: string;
  count: number;
  firstSeen: number;
  lastSeen: number;
};

const metrics = new Map<string, ErrorMetric>();

export function recordErrorMetric(error: NormalizedAppError) {
  const existing = metrics.get(error.code);
  if (existing) {
    existing.count += 1;
    existing.lastSeen = Date.now();
    return;
  }

  metrics.set(error.code, {
    code: error.code,
    count: 1,
    firstSeen: Date.now(),
    lastSeen: Date.now(),
  });
}

export function getErrorMetrics() {
  return Array.from(metrics.values()).sort((a, b) => b.count - a.count);
}

export function resetErrorMetrics() {
  metrics.clear();
}

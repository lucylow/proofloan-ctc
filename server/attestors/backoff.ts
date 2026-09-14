export type BackoffConfig = { baseMs: number; maxMs: number; factor: number; jitter: number };
export const defaultBackoff: BackoffConfig = { baseMs: 200, maxMs: 10_000, factor: 2, jitter: 0.15 };
export function calculateBackoff(attempt: number, config = defaultBackoff, random = Math.random): number {
  const raw = Math.min(config.maxMs, config.baseMs * config.factor ** Math.max(0, attempt));
  const jitter = raw * config.jitter * (random() * 2 - 1);
  return Math.min(config.maxMs, Math.max(0, Math.round(raw + jitter)));
}

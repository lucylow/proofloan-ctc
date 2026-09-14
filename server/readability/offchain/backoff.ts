import type { RetryClass } from "./types";

export type BackoffPolicy = {
  baseMs: number;
  maxMs: number;
  jitterRatio: number;
};

export function backoffDelay(attempt: number, policy: BackoffPolicy, retryClass: RetryClass): number {
  const multiplier = retryClass === "rate-limit" ? 2.5 : retryClass === "attestation" ? 1.6 : retryClass === "reorg" ? 2 : 1;
  const raw = Math.min(policy.maxMs, policy.baseMs * multiplier * 2 ** Math.max(0, attempt - 1));
  const jitter = raw * Math.max(0, Math.min(1, policy.jitterRatio));
  return Math.max(0, Math.floor(raw - jitter / 2 + Math.random() * jitter));
}

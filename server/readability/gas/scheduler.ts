import type { OptimizationDecision } from "./models";

export type ScheduledJob<T> = {
  job: T;
  decision: OptimizationDecision;
  runAfter: number;
};

export function nextRunAfter(decision: OptimizationDecision, now = Date.now()): number {
  if (decision.action === "submit-now") return now;
  if (decision.action === "wait") return now + 30_000;
  if (decision.action === "manual-review") return now + 5 * 60_000;
  return Number.POSITIVE_INFINITY;
}

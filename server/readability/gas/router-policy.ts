import type { OptimizationDecision } from "./models";

export function chooseLane(decision: OptimizationDecision): "fast" | "standard" | "manual" {
  if (decision.action === "reject") return "manual";
  if (decision.risk === "low" && decision.priority >= 70) return "fast";
  if (decision.risk === "high" || decision.action === "manual-review") return "manual";
  return "standard";
}

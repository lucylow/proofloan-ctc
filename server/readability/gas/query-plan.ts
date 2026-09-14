import { planContinuity } from "./continuity";
import { estimateReadabilityGas } from "./estimator";
import type { GasEstimateInput, OptimizationDecision } from "./models";
import { classifyGasRisk } from "./risk";

export type QueryPlanningInput = GasEstimateInput & {
  eventBlock: number;
  attestedBlock: number;
  deadlineMs?: number;
  nowMs?: number;
};

export function optimizeQuery(input: QueryPlanningInput): OptimizationDecision {
  const estimate = estimateReadabilityGas(input);
  const risk = classifyGasRisk(estimate);
  const continuity = planContinuity(input.eventBlock, input.attestedBlock);
  const now = input.nowMs ?? Date.now();
  const urgency =
    input.deadlineMs == null
      ? 0.5
      : Math.max(0, Math.min(1, 1 - Math.max(0, input.deadlineMs - now) / 86_400_000));
  const recommendations: string[] = [];
  let action: OptimizationDecision["action"] = "submit-now";
  if (risk === "blocked") {
    action = "reject";
    recommendations.push("route to manual review or request a smaller transaction");
  } else if (risk === "high" && urgency < 0.6) {
    action = "wait";
    recommendations.push("submit closer to finalization to reduce continuity length");
  } else if (risk === "medium") {
    action = urgency > 0.8 ? "submit-now" : "manual-review";
    recommendations.push("prefer recent attestations and monitor proof size");
  }
  if (continuity.recommendation === "submit-now") {
    recommendations.push("prioritize immediately after attestation becomes available");
  }
  const priority = Math.round((1 - Math.min(1, estimate.estimatedCtc / 0.001)) * 50 + urgency * 50);
  return {
    action,
    risk,
    priority,
    estimatedCtc: estimate.estimatedCtc,
    officialCtc: estimate.officialCtc,
    continuityHashCount: estimate.continuityHashCount,
    reasons: estimate.reasons,
    recommendations,
  };
}

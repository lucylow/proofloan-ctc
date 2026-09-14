import type { Decision } from "@shared/proofloan";
import type { AiUncertainty } from "./aiTypes";
import { AI_MIN_CONFIDENCE_TO_ACT } from "./constants";
import { uncertaintyAllowsAction } from "./uncertainty";

export type AiActionPolicy = { minConfidence: number; maxPd30: number; maxPd90: number; requireReasonCodes: boolean; allowAbstain: boolean };
export const DEFAULT_AI_ACTION_POLICY: AiActionPolicy = { minConfidence: AI_MIN_CONFIDENCE_TO_ACT, maxPd30: .30, maxPd90: .42, requireReasonCodes: true, allowAbstain: true };
export function evaluateAiPolicy(decision: Decision, uncertainty: AiUncertainty, policy = DEFAULT_AI_ACTION_POLICY): { allowed: boolean; reason: string } {
  if (decision.pd30 > policy.maxPd30) return { allowed: false, reason: "pd30 exceeds AI action policy" };
  if (decision.pd90 > policy.maxPd90) return { allowed: false, reason: "pd90 exceeds AI action policy" };
  if (policy.requireReasonCodes && decision.reasonCodes.length === 0) return { allowed: false, reason: "missing reason codes" };
  if (!uncertaintyAllowsAction(uncertainty, policy.minConfidence, decision.confidence)) return { allowed: false, reason: "confidence or uncertainty does not satisfy action policy" };
  return { allowed: true, reason: "AI output satisfies bounded advisory policy" };
}

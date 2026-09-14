import { AI_MAX_PD30, AI_MAX_PD90 } from "./constants";
import type { Decision } from "@shared/proofloan";

export function monotonicPd(pd30: number, pd90: number): { pd30: number; pd90: number } {
  const a = Math.min(AI_MAX_PD30, Math.max(0, pd30));
  const b = Math.min(AI_MAX_PD90, Math.max(a, pd90));
  return { pd30: a, pd90: b };
}
export function isotonicLikeCalibration(pd: number, evidence: number, freshness: number): number {
  const support = Math.min(1, evidence / 10) * .04;
  const stale = (1 - freshness) * .06;
  return Math.min(.99, Math.max(0, pd * (1 - support + stale)));
}
export function calibrateDecision(decision: Decision): Decision {
  const p = monotonicPd(decision.pd30, decision.pd90);
  const pd30 = isotonicLikeCalibration(p.pd30, 5, decision.freshnessScore);
  const pd90 = Math.max(pd30, isotonicLikeCalibration(p.pd90, 5, decision.freshnessScore));
  const confidence = Math.min(decision.confidence, .98);
  const base = { ...decision, pd30, pd90, confidence };
  return { ...base, decisionHash: JSON.stringify(base).length.toString(16) + decision.decisionHash.slice(-12) };
}

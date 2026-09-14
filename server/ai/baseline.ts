import type { Decision, FeatureVector, ReasonCode, VerifiedFact } from "@shared/proofloan";
import { AI_FEATURE_VERSION, AI_MODEL_VERSION, AI_POLICY_HASH } from "./constants";
import { shortHash } from "./fingerprint";

export function riskTier(pd30: number): Decision["riskTier"] { return pd30 < .10 ? "A" : pd30 < .18 ? "B" : pd30 < .30 ? "C" : "D"; }
export function baselineScore(features: FeatureVector, facts: VerifiedFact[]): Decision {
  const evidencePenalty = features.evidenceCount < 2 ? 0.06 : features.evidenceCount < 4 ? 0.02 : 0;
  const freshnessPenalty = (1 - features.freshnessScore) * 0.10;
  const pd30 = Math.min(.80, Math.max(.02, .10 + features.latePayments * .08 + Math.min(features.leverageRatio, 1) * .08 - features.repaymentCount * .022 + evidencePenalty + freshnessPenalty));
  const pd90 = Math.min(.90, Math.max(pd30, pd30 + .08 + freshnessPenalty / 2));
  const reasons: ReasonCode[] = [];
  if (features.repaymentCount >= 2) reasons.push("STRONG_REPAYMENT_HISTORY");
  if (features.latePayments > 0) reasons.push("RECENT_LATE_PAYMENT");
  if (features.leverageRatio > .8) reasons.push("HIGH_LEVERAGE");
  if (features.evidenceCount < 2 || features.freshnessScore < .5) reasons.push("SPARSE_EVIDENCE");
  if (!reasons.length) reasons.push("SPARSE_EVIDENCE");
  const confidence = Math.min(.98, Math.max(.15, .55 + Math.min(.30, features.evidenceCount * .045) + features.freshnessScore * .12 - (features.latePayments > 2 ? .08 : 0)));
  const evidenceRoot = shortHash(facts.map(f => f.proofRoot), 24);
  const core = { pd30, pd90, confidence, freshnessScore: features.freshnessScore, riskTier: riskTier(pd30), reasonCodes: reasons, modelVersion: AI_MODEL_VERSION, featureVersion: AI_FEATURE_VERSION, evidenceRoot, policyHash: AI_POLICY_HASH, featureFingerprint: shortHash(features, 24) };
  return { ...core, decisionHash: shortHash(core, 24) };
}

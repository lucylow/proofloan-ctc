import type { FeatureVector, VerifiedFact } from "@shared/proofloan";
import type { AiUncertainty } from "./aiTypes";
import { AI_STALE_PENALTY } from "./constants";

export function estimateUncertainty(features: FeatureVector, facts: VerifiedFact[]): AiUncertainty {
  const evidenceCoverage = Math.min(1, features.evidenceCount / 8) * .7 + features.freshnessScore * .3;
  const staleFraction = facts.length ? facts.filter(f => f.freshness === "Stale").length / facts.length : 1;
  const aleatoric = Math.min(1, .12 + features.latePayments * .04);
  const epistemic = Math.min(1, .55 - evidenceCoverage * .45 + staleFraction * AI_STALE_PENALTY);
  return { aleatoric, epistemic, total: Math.min(1, (aleatoric + epistemic) / 1.8), evidenceCoverage, staleEvidencePenalty: staleFraction * AI_STALE_PENALTY };
}
export function uncertaintyAllowsAction(u: AiUncertainty, minConfidence: number, confidence: number): boolean { return confidence >= minConfidence && u.total <= .55 && u.evidenceCoverage >= .35; }

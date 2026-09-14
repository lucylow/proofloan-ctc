import type { FeatureVector, VerifiedFact } from "@shared/proofloan";
import type { AiCounterfactual } from "./aiTypes";
import { baselineScore } from "./baseline";

const clamp = (key: keyof FeatureVector, value: number) => key === "freshnessScore" ? Math.min(1, Math.max(0, value)) : Math.max(0, value);
export function counterfactuals(features: FeatureVector, names: Array<{name: string; feature: keyof FeatureVector; delta: number}>, facts: VerifiedFact[] = []): AiCounterfactual[] {
  const before = baselineScore(features, facts);
  return names.map(spec => { const mutated = { ...features, [spec.feature]: clamp(spec.feature, features[spec.feature] + spec.delta) }; const after = baselineScore(mutated, facts); return { ...spec, decisionBefore: before, decisionAfter: after, pd30Delta: after.pd30 - before.pd30, riskTierChanged: before.riskTier !== after.riskTier }; });
}

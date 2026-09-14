import type { FeatureVector } from "@shared/proofloan";
import type { AiDriftReport } from "./aiTypes";
import { AI_DRIFT_HIGH, AI_DRIFT_MEDIUM } from "./constants";

const keys: Array<keyof FeatureVector> = ["repaymentCount","latePayments","leverageRatio","walletAgeDays","volume7d","volume30d","volume180d","evidenceCount","freshnessScore"];
export function featureDrift(baseline: FeatureVector, current: FeatureVector): AiDriftReport[] {
  return keys.map(feature => { const a = baseline[feature]; const b = current[feature]; const abs = Math.abs(b - a); const rel = abs / Math.max(Math.abs(a), 1); const severity = rel >= AI_DRIFT_HIGH ? "high" : rel >= AI_DRIFT_MEDIUM ? "medium" : "low"; return { feature, baselineMean: a, currentMean: b, absoluteShift: abs, relativeShift: rel, severity }; });
}

import type { Decision } from "@shared/proofloan";
import type { ProviderCandidate } from "./provider";
import { riskTier } from "./baseline";

const clamp = (v: unknown, fallback: number): number => { const n = typeof v === "number" ? v : Number(v); return Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : fallback; };
export function sanitizeCandidate(candidate: Partial<ProviderCandidate>, baseline: Decision): ProviderCandidate {
  const pd30 = clamp(candidate.pd30, baseline.pd30); const pd90 = Math.max(pd30, clamp(candidate.pd90, baseline.pd90)); const confidence = Math.min(baseline.freshnessScore, clamp(candidate.confidence, baseline.confidence));
  const allowed = new Set(["STRONG_REPAYMENT_HISTORY","RECENT_LATE_PAYMENT","HIGH_LEVERAGE","SPARSE_EVIDENCE"]);
  const reasonCodes = Array.isArray(candidate.reasonCodes) ? candidate.reasonCodes.filter(v => typeof v === "string" && allowed.has(v)) as ProviderCandidate["reasonCodes"] : [];
  return { pd30, pd90, confidence, reasonCodes: reasonCodes.length ? reasonCodes : baseline.reasonCodes };
}
export function applyRiskTier(candidate: ProviderCandidate): Pick<Decision,"pd30"|"pd90"|"confidence"|"riskTier"|"reasonCodes"> { return { ...candidate, riskTier: riskTier(candidate.pd30) }; }

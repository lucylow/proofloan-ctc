import type { FeatureVector, VerifiedFact } from "@shared/proofloan";
import type { AiEvidenceLink, AiReason } from "./aiTypes";

export function reasonFromCode(code: string, features: FeatureVector): AiReason {
  switch (code) {
    case "STRONG_REPAYMENT_HISTORY": return { code, weight: Math.min(1, features.repaymentCount / 6), direction: "positive", text: "Multiple verified repayment events support lower expected credit risk." };
    case "RECENT_LATE_PAYMENT": return { code, weight: Math.min(1, features.latePayments / 3), direction: "negative", text: "Verified late-payment evidence increases predicted near-term risk." };
    case "HIGH_LEVERAGE": return { code, weight: Math.min(1, features.leverageRatio), direction: "negative", text: "Observed repayment volume is high relative to verified collateral coverage." };
    default: return { code: "SPARSE_EVIDENCE", weight: Math.max(0, 1 - features.evidenceCount / 8), direction: "negative", text: "The evidence set is too small or stale for high-confidence underwriting." };
  }
}
export function evidenceLinks(facts: VerifiedFact[], features: FeatureVector): AiEvidenceLink[] {
  const links: AiEvidenceLink[] = [];
  for (const fact of facts) {
    const contribution = fact.eventType === "REPAYMENT" ? .9 : fact.eventType === "LATE_PAYMENT" ? -.8 : .4;
    const field = fact.eventType === "REPAYMENT" ? "repaymentCount" : fact.eventType === "LATE_PAYMENT" ? "latePayments" : "collateralCoverage";
    links.push({ factId: fact.id, field, contribution, proofRoot: fact.proofRoot });
  }
  if (features.evidenceCount === 0) return [];
  return links.slice(0, 32);
}

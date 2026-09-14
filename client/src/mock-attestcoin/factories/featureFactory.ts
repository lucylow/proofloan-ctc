import type { MockApplication, MockFeatureVector, MockVerifiedFact } from "../types";
import { clamp, round } from "../utils";

export function createMockFeatures(
  applications: MockApplication[],
  facts: MockVerifiedFact[],
): MockFeatureVector[] {
  return applications.map(application => {
    const related = facts.filter(fact => fact.applicationId === application.id);
    const repayments = related.filter(fact => fact.eventType === "REPAYMENT");
    const lates = related.filter(fact => fact.eventType === "LATE_PAYMENT");
    const volume = related.reduce((total, fact) => total + fact.amount, 0);
    const freshness = related.length === 0
      ? 0
      : Math.round((related.reduce((total, fact) => total + (fact.freshness === "Fresh" ? 1 : fact.freshness === "Aging" ? 0.55 : 0.1), 0) / related.length) * 100);

    return {
      applicationId: application.id,
      repaymentCount: repayments.length,
      latePayments: lates.length,
      leverageRatio: clamp(lates.length * 0.18 + (application.amount > 4000 ? 0.22 : 0.11), 0, 1),
      walletAgeDays: application.id === "PL-7F42A91C" ? 412 : 180,
      volume7d: round(volume * 0.18, 0),
      volume30d: round(volume * 0.55, 0),
      volume180d: round(volume, 0),
      evidenceCount: related.length,
      freshnessScore: freshness,
    };
  });
}

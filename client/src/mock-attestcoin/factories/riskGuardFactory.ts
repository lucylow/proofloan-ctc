import type { MockApplication, MockFeatureVector, MockRiskGuardCheck } from "../types";

export function createMockRiskGuards(
  applications: MockApplication[],
  features: MockFeatureVector[],
): MockRiskGuardCheck[] {
  return applications.map(application => {
    const feature = features.find(item => item.applicationId === application.id);
    const freshnessOk = (feature?.freshnessScore ?? 0) >= 60;
    const confidenceOk = application.confidence >= 70;
    const ltvOk = application.amount <= 5000;
    const amountOk = application.amount <= 7500;
    const blocked = application.state === "Rejected" || !freshnessOk || !confidenceOk;

    return {
      applicationId: application.id,
      amountOk,
      ltvOk,
      rateOk: true,
      freshnessOk,
      confidenceOk,
      liquidityOk: true,
      status: blocked ? "Blocked" : "Ready",
      rejectionReason: blocked
        ? !freshnessOk
          ? "Evidence freshness is below the RiskGuard threshold."
          : application.state === "Rejected"
            ? "Policy rejected the application."
            : "Confidence is below the RiskGuard threshold."
        : undefined,
    };
  });
}

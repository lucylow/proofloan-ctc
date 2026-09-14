import type {
  DemoApplication,
  DemoCreditFile,
  DemoEvidence,
} from "../types";

export function createDemoCreditFile(
  applications: DemoApplication[],
  evidence: DemoEvidence[],
): DemoCreditFile {
  const primary =
    applications.find(
      application =>
        application.id === "PL-7F42A91C",
    ) ?? applications[0];

  const totalEvidence = evidence.length;

  const freshEvidence = evidence.filter(
    item => item.freshness === "Fresh",
  ).length;

  const staleEvidence = evidence.filter(
    item =>
      item.freshness === "Stale" ||
      item.freshness === "Aging",
  ).length;

  if (!primary) {
    return {
      score: 0,
      riskTier: "E",
      confidence: 0,
      walletAgeDays: 0,
      totalEvidence,
      freshEvidence,
      staleEvidence,
      repaymentCount: 0,
      latePaymentCount: 0,
      averageRepaymentDays: 0,
      leverageRatio: 0,
      utilizationRatio: 0,
      liquidityCoverage: 0,
      evidenceCoverage: 0,
      freshnessScore: 0,
    };
  }

  return {
    score: 742,
    riskTier: primary.riskTier,
    confidence: primary.confidence,
    walletAgeDays: primary.walletAgeDays,
    totalEvidence,
    freshEvidence,
    staleEvidence,
    repaymentCount: 21,
    latePaymentCount: 1,
    averageRepaymentDays: 18,
    leverageRatio: primary.leverageRatio,
    utilizationRatio: 0.24,
    liquidityCoverage: 1.78,
    evidenceCoverage: 0.94,
    freshnessScore:
      totalEvidence === 0
        ? 0
        : Math.round(
            (freshEvidence /
              totalEvidence) *
              100,
          ),
  };
}

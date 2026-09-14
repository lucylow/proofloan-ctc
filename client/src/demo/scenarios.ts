import type {
  DemoDataSet,
  DemoScenario,
} from "./types";

export function applyScenario(
  data: DemoDataSet,
  scenario: DemoScenario,
): DemoDataSet {
  const clone: DemoDataSet =
    structuredClone(data);

  clone.scenario = scenario;

  switch (scenario) {
    case "hero":
      return applyHeroScenario(clone);

    case "healthy":
      return applyHealthyScenario(clone);

    case "active-loan":
      return applyActiveLoanScenario(clone);

    case "review":
      return applyReviewScenario(clone);

    case "risk-warning":
      return applyRiskScenario(clone);

    case "empty":
      return applyEmptyScenario(clone);

    case "error-recovery":
      return applyErrorScenario(clone);

    default:
      return clone;
  }
}

function applyHeroScenario(
  data: DemoDataSet,
): DemoDataSet {
  return data;
}

function applyHealthyScenario(
  data: DemoDataSet,
): DemoDataSet {
  data.services = data.services.map(
    service => ({
      ...service,
      status: "healthy" as const,
      latencyMs: Math.min(
        service.latencyMs,
        220,
      ),
    }),
  );

  data.notifications =
    data.notifications.map(
      notification => ({
        ...notification,
        read: true,
      }),
    );

  return data;
}

function applyActiveLoanScenario(
  data: DemoDataSet,
): DemoDataSet {
  const application =
    data.applications.find(
      item =>
        item.id === "PL-61DD87CA",
    );

  if (application) {
    application.state = "Accepted";
  }

  const offer = data.offers.find(
    item =>
      item.applicationId ===
      "PL-61DD87CA",
  );

  if (offer) {
    offer.status = "Accepted";
  }

  return data;
}

function applyReviewScenario(
  data: DemoDataSet,
): DemoDataSet {
  const application =
    data.applications.find(
      item =>
        item.id === "PL-5A88D20E",
    );

  if (application) {
    application.state = "Paused";
    application.evidenceFreshness = 58;
  }

  return data;
}

function applyRiskScenario(
  data: DemoDataSet,
): DemoDataSet {
  const application =
    data.applications.find(
      item =>
        item.id === "PL-13E7CA4B",
    );

  if (application) {
    application.state = "Rejected";
    application.riskTier = "D";
    application.confidence = 87;
    application.leverageRatio = 0.71;
    application.loanToValue = 0.72;
  }

  data.services = data.services.map(
    service =>
      service.id === "execution"
        ? {
            ...service,
            status: "degraded" as const,
            latencyMs: 1180,
          }
        : service,
  );

  return data;
}

function applyEmptyScenario(
  data: DemoDataSet,
): DemoDataSet {
  data.applications = [];
  data.evidence = [];
  data.decisions = [];
  data.offers = [];
  data.activity = [];
  data.notifications = [];

  data.creditFile = {
    score: 0,
    riskTier: "E",
    confidence: 0,
    walletAgeDays: 0,
    totalEvidence: 0,
    freshEvidence: 0,
    staleEvidence: 0,
    repaymentCount: 0,
    latePaymentCount: 0,
    averageRepaymentDays: 0,
    leverageRatio: 0,
    utilizationRatio: 0,
    liquidityCoverage: 0,
    evidenceCoverage: 0,
    freshnessScore: 0,
  };

  data.portfolio = {
    totalApplications: 0,
    activeApplications: 0,
    executedLoans: 0,
    totalRequested: 0,
    totalExecuted: 0,
    availableCapacity: 0,
    averageRiskTier: "-",
    averageConfidence: 0,
  };

  return data;
}

function applyErrorScenario(
  data: DemoDataSet,
): DemoDataSet {
  data.services =
    data.services.map(
      service =>
        service.id === "attestcoin" ||
        service.id === "proof-worker"
          ? {
              ...service,
              status: "degraded" as const,
              latencyMs: 2200,
            }
          : service,
    );

  data.notifications.unshift({
    id: "N-ERROR",
    title: "Proof service degraded",
    description:
      "The verifier is responding slowly. Demo recovery state is active.",
    timestamp: new Date().toISOString(),
    read: false,
    severity: "error",
  });

  return data;
}

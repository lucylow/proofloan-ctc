import type {
  DemoActivityEvent,
  DemoApplication,
  DemoCreditFile,
  DemoDataSet,
  DemoDecision,
  DemoDecisionReason,
  DemoEvidence,
  DemoNotification,
  DemoOffer,
  DemoPortfolio,
  DemoScenario,
  DemoSystemService,
  DemoWallet,
  EvidenceType,
} from "@/demo/types";
import { MOCK_FEATURE_VERSION, MOCK_MODEL_VERSION, MOCK_POLICY_VERSION } from "./constants";
import { getMockChain, mockChainName } from "./chainCatalog";
import { clamp, round } from "./utils";
import type { MockDataset, MockScenario, MockVerifiedFact } from "./types";

const reasonMeta: Record<string, Pick<DemoDecisionReason, "label" | "severity" | "contribution">> = {
  STRONG_REPAYMENT_HISTORY: {
    label: "Strong repayment history",
    severity: "positive",
    contribution: 18,
  },
  RECENT_LATE_PAYMENT: {
    label: "Recent late payment",
    severity: "negative",
    contribution: -16,
  },
  HIGH_LEVERAGE: {
    label: "High leverage",
    severity: "negative",
    contribution: -12,
  },
  SPARSE_EVIDENCE: {
    label: "Sparse evidence",
    severity: "negative",
    contribution: -8,
  },
};

export function mockScenarioAsDemoScenario(scenario: MockScenario): DemoScenario {
  return scenario;
}

function asEvidenceType(eventType: MockVerifiedFact["eventType"]): EvidenceType {
  return eventType;
}

export function toDemoWallets(dataset: MockDataset): DemoWallet[] {
  return dataset.wallets.map(wallet => {
    const chain = getMockChain(wallet.chainId);
    return {
      id: wallet.id,
      label: wallet.label,
      address: wallet.address,
      ens: wallet.ens,
      chain: chain.name,
      chainId: chain.chainId,
      nativeBalance: `${round(wallet.nativeBalance, 3)} ${chain.nativeSymbol}`,
      stablecoinBalance: `${Math.round(wallet.stablecoinBalance).toLocaleString("en-US")} USDC`,
      walletAgeDays: wallet.walletAgeDays,
      verified: wallet.verified,
      connected: wallet.connected,
    };
  });
}

export function toDemoApplications(dataset: MockDataset): DemoApplication[] {
  return dataset.applications.map(application => {
    const feature = dataset.features.find(item => item.applicationId === application.id);
    const decision = dataset.decisions.find(item => item.applicationId === application.id);
    const offer = dataset.offers.find(item => item.applicationId === application.id);
    return {
      id: application.id,
      borrowerLabel: application.borrowerLabel,
      amount: application.amount,
      currency: application.currency,
      requestedTermDays: application.requestedTermDays,
      state: application.state,
      riskTier: application.riskTier,
      confidence: clamp(application.confidence, 0, 100),
      createdAt: application.createdAt,
      updatedAt: application.updatedAt,
      evidenceCount: feature?.evidenceCount ?? 0,
      evidenceFreshness: clamp(feature?.freshnessScore ?? 0, 0, 100),
      repaymentHistory: feature?.repaymentCount ?? 0,
      leverageRatio: clamp(feature?.leverageRatio ?? 0, 0, 1),
      loanToValue: clamp(offer?.ltv ?? 0.32, 0, 1),
      walletAgeDays: feature?.walletAgeDays ?? 0,
      decisionHash: decision?.decisionHash ?? "",
      policyHash: MOCK_POLICY_VERSION,
      modelVersion: MOCK_MODEL_VERSION,
      featureVersion: MOCK_FEATURE_VERSION,
    };
  });
}

export function toDemoEvidence(dataset: MockDataset): DemoEvidence[] {
  return dataset.facts.map(fact => ({
    id: fact.id,
    applicationId: fact.applicationId,
    chain: mockChainName(fact.chainId),
    chainId: getMockChain(fact.chainId).chainId,
    type: asEvidenceType(fact.eventType),
    amount: fact.amount,
    currency: fact.asset,
    sourceTransaction: fact.txHash,
    blockNumber: fact.sourceBlock,
    timestamp: fact.observedAt,
    freshness: fact.freshness,
    verifier: fact.verifier,
    confidence: fact.sourceVerified ? 97 : 72,
    verified: fact.sourceVerified,
  }));
}

export function toDemoDecisions(dataset: MockDataset): DemoDecision[] {
  return dataset.decisions.map(decision => {
    const application = dataset.applications.find(item => item.id === decision.applicationId);
    const guard = dataset.riskGuards.find(item => item.applicationId === decision.applicationId);
    const reasons: DemoDecisionReason[] = decision.reasonCodes.map(code => {
      const meta = reasonMeta[code] ?? {
        label: code.replace(/_/g, " ").toLowerCase(),
        severity: "neutral" as const,
        contribution: 0,
      };
      return { code, ...meta };
    });

    return {
      id: decision.id,
      applicationId: decision.applicationId,
      riskTier: decision.riskTier,
      probability30d: clamp(decision.pd30, 0, 100),
      probability90d: clamp(decision.pd90, 0, 100),
      confidence: clamp(decision.confidence, 0, 100),
      modelVersion: MOCK_MODEL_VERSION,
      featureVersion: MOCK_FEATURE_VERSION,
      policyHash: application?.id ? MOCK_POLICY_VERSION : MOCK_POLICY_VERSION,
      generatedAt: decision.generatedAt,
      reasons,
      policyChecks: {
        amount: guard?.amountOk ?? true,
        ltv: guard?.ltvOk ?? true,
        freshness: guard?.freshnessOk ?? true,
        confidence: guard?.confidenceOk ?? true,
        liquidity: guard?.liquidityOk ?? true,
      },
    };
  });
}

export function toDemoOffers(dataset: MockDataset): DemoOffer[] {
  return dataset.offers.map(offer => ({
    id: offer.id,
    applicationId: offer.applicationId,
    amount: offer.amount,
    apr: clamp(offer.apr, 0, 100),
    ltv: clamp(offer.ltv, 0, 1),
    termDays: offer.termDays,
    fee: offer.fee,
    currency: "USDC",
    status: offer.status,
    expiresAt: offer.expiresAt,
    pool: offer.pool,
    policyVersion: MOCK_POLICY_VERSION,
    riskTier: offer.riskTier,
    featured: offer.featured,
  }));
}

export function toDemoActivity(dataset: MockDataset): DemoActivityEvent[] {
  return dataset.timelines.map(event => ({
    id: event.id,
    applicationId: event.applicationId,
    category: event.category,
    title: event.title,
    description: event.description,
    timestamp: event.timestamp,
    severity: event.severity,
  }));
}

export function toDemoNotifications(dataset: MockDataset): DemoNotification[] {
  return dataset.notifications.map(item => ({
    id: item.id,
    title: item.title,
    description: item.description,
    timestamp: item.timestamp,
    read: item.read,
    severity: item.severity,
  }));
}

export function toDemoServices(dataset: MockDataset): DemoSystemService[] {
  const checked = dataset.health.lastCheckedAt;
  const latency = dataset.health.latencyMs;
  return [
    {
      id: "wallet",
      name: "Wallet gateway",
      status: dataset.health.sourceRpc,
      latencyMs: latency,
      lastChecked: checked,
    },
    {
      id: "attestcoin",
      name: "Attestcoin verifier",
      status: dataset.health.proofBuilder,
      latencyMs: latency,
      lastChecked: checked,
    },
    {
      id: "proof-worker",
      name: "Proof worker",
      status: dataset.health.proofBuilder,
      latencyMs: latency,
      lastChecked: checked,
    },
    {
      id: "underwriter",
      name: "Underwriting service",
      status: dataset.health.creditcoinRpc === "offline" ? "offline" : "healthy",
      latencyMs: Math.min(latency, 400),
      lastChecked: checked,
    },
    {
      id: "riskguard",
      name: "RiskGuard",
      status: dataset.health.creditcoinRpc === "offline" ? "offline" : "healthy",
      latencyMs: Math.min(latency, 180),
      lastChecked: checked,
    },
    {
      id: "execution",
      name: "Execution gateway",
      status: dataset.scenario === "recovery" ? "degraded" : dataset.health.creditcoinRpc,
      latencyMs: dataset.scenario === "recovery" ? 1180 : latency,
      lastChecked: checked,
    },
  ];
}

export function toDemoCreditFile(dataset: MockDataset): DemoCreditFile {
  const application = dataset.applications.find(item => item.id === "PL-7F42A91C") ?? dataset.applications[0];
  const feature = application
    ? dataset.features.find(item => item.applicationId === application.id)
    : undefined;
  const freshEvidence = dataset.facts.filter(fact => fact.freshness === "Fresh").length;
  const staleEvidence = dataset.facts.filter(fact => fact.freshness !== "Fresh").length;

  if (!application) {
    return {
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
  }

  return {
    score: application.riskTier === "A" ? 780 : application.riskTier === "B" ? 742 : 610,
    riskTier: application.riskTier,
    confidence: application.confidence,
    walletAgeDays: feature?.walletAgeDays ?? 0,
    totalEvidence: dataset.facts.length,
    freshEvidence,
    staleEvidence,
    repaymentCount: feature?.repaymentCount ?? 0,
    latePaymentCount: feature?.latePayments ?? 0,
    averageRepaymentDays: 18,
    leverageRatio: clamp(feature?.leverageRatio ?? 0, 0, 1),
    utilizationRatio: 0.24,
    liquidityCoverage: dataset.facts.some(fact => fact.eventType === "LIQUIDITY") ? 1.78 : 0.4,
    evidenceCoverage: dataset.facts.length === 0 ? 0 : 0.94,
    freshnessScore: feature?.freshnessScore ?? 0,
  };
}

export function toDemoPortfolio(dataset: MockDataset): DemoPortfolio {
  const applications = dataset.applications;
  const executed = applications.filter(item => item.state === "Executed");
  const averageConfidence = applications.length === 0
    ? 0
    : Math.round(applications.reduce((total, item) => total + item.confidence, 0) / applications.length);

  return {
    totalApplications: applications.length,
    activeApplications: applications.filter(item => item.state !== "Rejected" && item.state !== "Executed").length,
    executedLoans: executed.length,
    totalRequested: applications.reduce((total, item) => total + item.amount, 0),
    totalExecuted: executed.reduce((total, item) => total + item.amount, 0),
    availableCapacity: 8500,
    averageRiskTier: applications[0]?.riskTier ?? "-",
    averageConfidence,
  };
}

export function toDemoDataset(dataset: MockDataset): DemoDataSet {
  return {
    scenario: mockScenarioAsDemoScenario(dataset.scenario),
    wallets: toDemoWallets(dataset),
    applications: toDemoApplications(dataset),
    evidence: toDemoEvidence(dataset),
    decisions: toDemoDecisions(dataset),
    offers: toDemoOffers(dataset),
    activity: toDemoActivity(dataset),
    notifications: toDemoNotifications(dataset),
    services: toDemoServices(dataset),
    creditFile: toDemoCreditFile(dataset),
    portfolio: toDemoPortfolio(dataset),
  };
}

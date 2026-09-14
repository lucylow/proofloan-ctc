export type DemoScenario =
  | "hero"
  | "healthy"
  | "active-loan"
  | "review"
  | "risk-warning"
  | "empty"
  | "error-recovery"
  | "cross-chain-wealth"
  | "strong-repayment"
  | "fresh-evidence"
  | "aging-evidence"
  | "proof-delay"
  | "proof-rejected"
  | "partial-attestation"
  | "multi-chain"
  | "new-wallet"
  | "high-risk"
  | "recovery"
  | "judge";

export type DemoApplicationState =
  | "Draft"
  | "Submitted"
  | "VerifyingEvidence"
  | "EvidenceVerified"
  | "Scored"
  | "OfferReady"
  | "Accepted"
  | "Executed"
  | "Rejected"
  | "Paused";

export type EvidenceType =
  | "REPAYMENT"
  | "COLLATERAL_DEPOSIT"
  | "LIQUIDITY"
  | "WALLET_ACTIVITY"
  | "LATE_PAYMENT"
  | "BALANCE_HISTORY"
  | "CONTRACT_INTERACTION";

export type EvidenceFreshness =
  | "Fresh"
  | "Aging"
  | "Stale"
  | "Unknown";

export type RiskTier =
  | "A"
  | "B"
  | "C"
  | "D"
  | "E";

export type OfferStatus =
  | "Ready"
  | "Expiring"
  | "Unavailable"
  | "Accepted"
  | "Executed";

export type DemoWallet = {
  id: string;
  label: string;
  address: string;
  ens?: string;
  chain: string;
  chainId: number;
  nativeBalance: string;
  stablecoinBalance: string;
  walletAgeDays: number;
  verified: boolean;
  connected: boolean;
};

export type DemoApplication = {
  id: string;
  borrowerLabel: string;
  amount: number;
  currency: string;
  requestedTermDays: number;
  state: DemoApplicationState;
  riskTier: RiskTier;
  confidence: number;
  createdAt: string;
  updatedAt: string;
  evidenceCount: number;
  evidenceFreshness: number;
  repaymentHistory: number;
  leverageRatio: number;
  loanToValue: number;
  walletAgeDays: number;
  decisionHash: string;
  policyHash: string;
  modelVersion: string;
  featureVersion: string;
};

export type DemoEvidence = {
  id: string;
  applicationId: string;
  chain: string;
  chainId: number;
  type: EvidenceType;
  amount?: number;
  currency?: string;
  sourceTransaction: string;
  blockNumber: number;
  timestamp: string;
  freshness: EvidenceFreshness;
  verifier: string;
  confidence: number;
  verified: boolean;
};

export type DemoDecisionReason = {
  code: string;
  label: string;
  severity: "positive" | "neutral" | "negative";
  contribution: number;
};

export type DemoDecision = {
  id: string;
  applicationId: string;
  riskTier: RiskTier;
  probability30d: number;
  probability90d: number;
  confidence: number;
  modelVersion: string;
  featureVersion: string;
  policyHash: string;
  generatedAt: string;
  reasons: DemoDecisionReason[];
  policyChecks: {
    amount: boolean;
    ltv: boolean;
    freshness: boolean;
    confidence: boolean;
    liquidity: boolean;
  };
};

export type DemoOffer = {
  id: string;
  applicationId: string;
  amount: number;
  apr: number;
  ltv: number;
  termDays: number;
  fee: number;
  currency: string;
  status: OfferStatus;
  expiresAt: string;
  pool: string;
  policyVersion: string;
  riskTier: RiskTier;
  featured?: boolean;
};

export type DemoActivityEvent = {
  id: string;
  applicationId?: string;
  category:
    | "wallet"
    | "evidence"
    | "underwriting"
    | "policy"
    | "offer"
    | "system";
  title: string;
  description: string;
  timestamp: string;
  severity: "info" | "success" | "warning" | "error";
  metadata?: Record<string, string>;
};

export type DemoNotification = {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  severity: "info" | "success" | "warning" | "error";
};

export type DemoSystemService = {
  id: string;
  name: string;
  status: "healthy" | "degraded" | "offline";
  latencyMs: number;
  lastChecked: string;
};

export type DemoCreditFile = {
  score: number;
  riskTier: RiskTier;
  confidence: number;
  walletAgeDays: number;
  totalEvidence: number;
  freshEvidence: number;
  staleEvidence: number;
  repaymentCount: number;
  latePaymentCount: number;
  averageRepaymentDays: number;
  leverageRatio: number;
  utilizationRatio: number;
  liquidityCoverage: number;
  evidenceCoverage: number;
  freshnessScore: number;
};

export type DemoPortfolio = {
  totalApplications: number;
  activeApplications: number;
  executedLoans: number;
  totalRequested: number;
  totalExecuted: number;
  availableCapacity: number;
  averageRiskTier: string;
  averageConfidence: number;
};

export type DemoDataSet = {
  scenario: DemoScenario;
  wallets: DemoWallet[];
  applications: DemoApplication[];
  evidence: DemoEvidence[];
  decisions: DemoDecision[];
  offers: DemoOffer[];
  activity: DemoActivityEvent[];
  notifications: DemoNotification[];
  services: DemoSystemService[];
  creditFile: DemoCreditFile;
  portfolio: DemoPortfolio;
};

import type { MockScenario } from "./constants";

export type { MockScenario };

export type MockChainId =
  | "ethereum-sepolia"
  | "polygon-amoy"
  | "arbitrum-sepolia"
  | "base-sepolia"
  | "optimism-sepolia";

export type MockChainName =
  | "Ethereum Sepolia"
  | "Polygon Amoy"
  | "Arbitrum Sepolia"
  | "Base Sepolia"
  | "Optimism Sepolia";

export type MockProofStatus =
  | "queued"
  | "attesting"
  | "proven"
  | "verified"
  | "rejected"
  | "delayed"
  | "partial";

export type MockFactEvent =
  | "REPAYMENT"
  | "COLLATERAL_DEPOSIT"
  | "LATE_PAYMENT"
  | "LIQUIDITY"
  | "WALLET_ACTIVITY";

export type MockFreshness = "Fresh" | "Aging" | "Stale";
export type MockRiskTier = "A" | "B" | "C" | "D" | "E";
export type MockHealthStatus = "healthy" | "degraded" | "offline";
export type MockApplicationState =
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

export type MockChain = {
  id: MockChainId;
  name: MockChainName;
  chainKey: number | null;
  chainId: number;
  nativeSymbol: string;
  explorerTx: string;
  enabled: boolean;
  experimental?: boolean;
};

export type MockWallet = {
  id: string;
  label: string;
  address: string;
  ens?: string;
  chainId: MockChainId;
  nativeBalance: number;
  stablecoinBalance: number;
  walletAgeDays: number;
  verified: boolean;
  connected: boolean;
};

export type MockTransaction = {
  id: string;
  walletId: string;
  applicationId: string;
  chainId: MockChainId;
  txHash: string;
  blockNumber: number;
  timestamp: string;
  eventType: MockFactEvent;
  amount: number;
  asset: "USDC" | "ETH" | "MATIC";
  confirmations: number;
  finalized: boolean;
};

export type MockSourceBlock = {
  id: string;
  chainId: MockChainId;
  blockNumber: number;
  blockHash: string;
  timestamp: string;
  attested: boolean;
  attestationRound: number;
  finalityLag: number;
};

export type MockProofRequest = {
  id: string;
  applicationId: string;
  txHash: string;
  chainId: MockChainId;
  status: MockProofStatus;
  requestedAt: string;
  completedAt?: string;
  sourceBlock: number;
  verificationBlock?: number;
  proofRoot?: string;
  latencyMs: number;
  retries: number;
  warnings: string[];
  presentationOnly: true;
};

export type MockAttestationRound = {
  id: string;
  proofRequestId: string;
  round: number;
  providers: number;
  signatures: number;
  quorum: number;
  signatureWeight: number;
  complete: boolean;
  status: "pending" | "quorum" | "insufficient";
};

export type MockMerkleProof = {
  id: string;
  proofRequestId: string;
  root: string;
  siblings: string[];
  leaf: string;
  valid: boolean;
};

export type MockContinuityProof = {
  id: string;
  proofRequestId: string;
  lowerEndpointDigest: string;
  roots: string[];
  contiguous: boolean;
  valid: boolean;
};

export type MockVerifiedFact = {
  id: string;
  applicationId: string;
  chainId: MockChainId;
  chainName: MockChainName;
  sourceBlock: number;
  txHash: string;
  eventType: MockFactEvent;
  amount: number;
  asset: string;
  verificationBlock: number;
  verifiedAt: string;
  observedAt: string;
  freshness: MockFreshness;
  proofRoot: string;
  verifier: string;
  sourceVerified: boolean;
  decoderVersion: string;
};

export type MockEvidenceNode = {
  id: string;
  applicationId: string;
  kind: "transaction" | "proof" | "fact" | "decision";
  refId: string;
  parentId?: string;
  label: string;
};

export type MockEvidenceSnapshot = {
  applicationId: string;
  evidenceRoot: string;
  factCount: number;
  freshnessScore: number;
  chainCount: number;
};

export type MockFeatureVector = {
  applicationId: string;
  repaymentCount: number;
  latePayments: number;
  leverageRatio: number;
  walletAgeDays: number;
  volume7d: number;
  volume30d: number;
  volume180d: number;
  evidenceCount: number;
  freshnessScore: number;
};

export type MockDecision = {
  id: string;
  applicationId: string;
  pd30: number;
  pd90: number;
  confidence: number;
  riskTier: MockRiskTier;
  reasonCodes: string[];
  evidenceRoot: string;
  decisionHash: string;
  generatedAt: string;
};

export type MockRiskGuardCheck = {
  applicationId: string;
  amountOk: boolean;
  ltvOk: boolean;
  rateOk: boolean;
  freshnessOk: boolean;
  confidenceOk: boolean;
  liquidityOk: boolean;
  status: "Ready" | "Blocked";
  rejectionReason?: string;
};

export type MockOffer = {
  id: string;
  applicationId: string;
  amount: number;
  apr: number;
  ltv: number;
  termDays: number;
  fee: number;
  status: "Ready" | "Expiring" | "Unavailable" | "Accepted" | "Executed";
  expiresAt: string;
  pool: string;
  riskTier: MockRiskTier;
  featured?: boolean;
};

export type MockApplication = {
  id: string;
  walletId: string;
  borrowerLabel: string;
  amount: number;
  currency: "USDC";
  requestedTermDays: number;
  state: MockApplicationState;
  riskTier: MockRiskTier;
  confidence: number;
  createdAt: string;
  updatedAt: string;
};

export type MockTimelineEvent = {
  id: string;
  applicationId: string;
  category: "wallet" | "evidence" | "underwriting" | "policy" | "offer" | "system";
  title: string;
  description: string;
  timestamp: string;
  severity: "info" | "success" | "warning" | "error";
};

export type MockNotification = {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  severity: "info" | "success" | "warning" | "error";
};

export type MockProtocolHealth = {
  creditcoinRpc: MockHealthStatus;
  proofBuilder: MockHealthStatus;
  sourceRpc: MockHealthStatus;
  lastCheckedAt: string;
  latencyMs: number;
  message?: string;
};

export type MockAnalytics = {
  applications: number;
  facts: number;
  verifiedFacts: number;
  previewFacts: number;
  proofsVerified: number;
  proofsRejected: number;
  averageProofLatencyMs: number;
  chainCoverage: number;
};

export type MockDataset = {
  seed: string;
  scenario: MockScenario;
  generatedAt: string;
  presentationOnly: true;
  chains: MockChain[];
  wallets: MockWallet[];
  transactions: MockTransaction[];
  sourceBlocks: MockSourceBlock[];
  proofRequests: MockProofRequest[];
  attestations: MockAttestationRound[];
  merkleProofs: MockMerkleProof[];
  continuityProofs: MockContinuityProof[];
  facts: MockVerifiedFact[];
  evidenceGraph: MockEvidenceNode[];
  evidenceSnapshots: MockEvidenceSnapshot[];
  features: MockFeatureVector[];
  decisions: MockDecision[];
  riskGuards: MockRiskGuardCheck[];
  offers: MockOffer[];
  applications: MockApplication[];
  timelines: MockTimelineEvent[];
  notifications: MockNotification[];
  health: MockProtocolHealth;
  analytics: MockAnalytics;
};

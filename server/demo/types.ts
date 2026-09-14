import type { FeatureVector, Decision, LoanSnapshot, SourceChain, VerifiedFact, Offer } from "@shared/proofloan";

export const DEMO_PROFILE_IDS = [
  "strong-borrower",
  "balanced-borrower",
  "high-risk-borrower",
  "sparse-evidence",
  "fresh-repayment",
  "late-payment",
  "stale-evidence",
  "cross-chain-history",
  "operator-down",
  "proof-builder-down",
  "database-offline",
  "riskguard-blocked",
] as const;

export type DemoProfileId = (typeof DEMO_PROFILE_IDS)[number];

export type DemoDataMode = "demo" | "live";
export type DemoFailureKind = "attestcoin" | "proof-builder" | "attestor" | "rpc" | "database";

export type DemoProfile = {
  id: DemoProfileId;
  label: string;
  description: string;
  chain: SourceChain;
  walletSeed: string;
  transactionSeed: string;
  facts: DemoFactSpec[];
  expected: {
    riskTier?: Decision["riskTier"];
    offerStatus?: Offer["status"];
    proofFallback?: boolean;
  };
};

export type DemoFactSpec = {
  ageDays: number;
  eventType: VerifiedFact["eventType"];
  amount: number;
  asset?: string;
  sourceBlockOffset: number;
  verificationOffset: number;
  freshness?: VerifiedFact["freshness"];
};

export type DemoFailureState = {
  enabled: boolean;
  kind: DemoFailureKind;
  message: string;
  retryAfterMs?: number;
};

export type DemoScenario = {
  scenarioId: string;
  profileId: DemoProfileId;
  mode: DemoDataMode;
  generatedAt: string;
  walletAddress: string;
  sourceChain: SourceChain;
  sourceTransactionHash: string;
  facts: VerifiedFact[];
  features: FeatureVector;
  failures: DemoFailureState[];
  notes: string[];
};

export type DemoFallbackDecision = {
  used: boolean;
  reason: string;
  provider?: string;
  scenarioId?: string;
};

export type DemoSnapshotEnvelope = {
  snapshot: LoanSnapshot;
  mode: DemoDataMode;
  fallback: DemoFallbackDecision;
  scenario: DemoScenario;
};

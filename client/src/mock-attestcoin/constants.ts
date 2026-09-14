export const MOCK_SEED = "proofloan-attestcoin-mock-v1";
export const MOCK_NOW_ISO = "2026-09-13T12:00:00.000Z";
export const MOCK_DECODER_VERSION = "mock-attestcoin-v1";
export const MOCK_MODEL_VERSION = "underwriter-v3.2";
export const MOCK_FEATURE_VERSION = "features-v2.1";
export const MOCK_POLICY_VERSION = "riskguard-v2.4";
export const MOCK_VERIFIER = "Attestcoin preview adapter";

export const MOCK_SCENARIOS = [
  "hero",
  "cross-chain-wealth",
  "strong-repayment",
  "fresh-evidence",
  "aging-evidence",
  "proof-delay",
  "proof-rejected",
  "partial-attestation",
  "multi-chain",
  "new-wallet",
  "high-risk",
  "empty",
  "recovery",
  "judge",
] as const;

export type MockScenario = (typeof MOCK_SCENARIOS)[number];

export const MOCK_SCENARIO_LABELS: Record<MockScenario, string> = {
  hero: "Hero demo",
  "cross-chain-wealth": "Cross-chain wealth",
  "strong-repayment": "Strong repayment",
  "fresh-evidence": "Fresh evidence",
  "aging-evidence": "Aging evidence",
  "proof-delay": "Proof delay",
  "proof-rejected": "Proof rejected",
  "partial-attestation": "Partial attestation",
  "multi-chain": "Multi-chain",
  "new-wallet": "New wallet",
  "high-risk": "High risk",
  empty: "Empty state",
  recovery: "Recovery",
  judge: "Judge mode",
};

export const MOCK_SCENARIO_DESCRIPTIONS: Record<MockScenario, string> = {
  hero: "Balanced protocol walkthrough for the default presentation.",
  "cross-chain-wealth": "Evidence and balances across five source chains.",
  "strong-repayment": "Dense verified repayment history and a strong risk tier.",
  "fresh-evidence": "Recently attested facts with high freshness scores.",
  "aging-evidence": "Older facts that should be visibly labeled as aging or stale.",
  "proof-delay": "Proofs waiting on attestation availability.",
  "proof-rejected": "Creditcoin verification rejected the proof.",
  "partial-attestation": "Quorum is incomplete; facts stay unverified.",
  "multi-chain": "Even coverage across Ethereum, Polygon, Arbitrum, Base, and Optimism.",
  "new-wallet": "Sparse history and a young wallet identity.",
  "high-risk": "Late payments and RiskGuard rejection.",
  empty: "No presentation records.",
  recovery: "Degraded protocol health with retryable proof failures.",
  judge: "Full Attestcoin trust path with provenance visible for review.",
};

export const PRIMARY_APPLICATION_ID = "PL-7F42A91C";
export const PRIMARY_WALLET_ID = "wallet-primary";

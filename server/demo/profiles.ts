import { DemoError } from "./errors";
import type { DemoProfile, DemoProfileId } from "./types";

const profile = (value: DemoProfile): DemoProfile => value;

export const DEMO_PROFILES: Record<DemoProfileId, DemoProfile> = {
  "strong-borrower": profile({
    id: "strong-borrower",
    label: "Strong borrower",
    description: "Dense recent repayment evidence with healthy collateral.",
    chain: "Ethereum Sepolia",
    walletSeed: "demo-strong",
    transactionSeed: "repayment-strong",
    facts: [
      { ageDays: 2, eventType: "REPAYMENT", amount: 2400, sourceBlockOffset: 10, verificationOffset: 3 },
      { ageDays: 4, eventType: "REPAYMENT", amount: 1800, sourceBlockOffset: 120, verificationOffset: 4 },
      { ageDays: 8, eventType: "COLLATERAL_DEPOSIT", amount: 9000, sourceBlockOffset: 240, verificationOffset: 5 },
      { ageDays: 20, eventType: "REPAYMENT", amount: 1500, sourceBlockOffset: 640, verificationOffset: 6 },
    ],
    expected: { riskTier: "A", offerStatus: "Ready", proofFallback: false },
  }),
  "balanced-borrower": profile({
    id: "balanced-borrower",
    label: "Balanced borrower",
    description: "Moderate activity with enough evidence for a mid-tier decision.",
    chain: "Ethereum Sepolia",
    walletSeed: "demo-balanced",
    transactionSeed: "repayment-balanced",
    facts: [
      { ageDays: 3, eventType: "REPAYMENT", amount: 1200, sourceBlockOffset: 11, verificationOffset: 4 },
      { ageDays: 15, eventType: "COLLATERAL_DEPOSIT", amount: 3500, sourceBlockOffset: 140, verificationOffset: 5 },
      { ageDays: 34, eventType: "REPAYMENT", amount: 900, sourceBlockOffset: 330, verificationOffset: 7 },
    ],
    expected: { riskTier: "B", offerStatus: "Ready", proofFallback: false },
  }),
  "high-risk-borrower": profile({
    id: "high-risk-borrower",
    label: "High-risk borrower",
    description: "High leverage plus a late-payment signal.",
    chain: "Ethereum Sepolia",
    walletSeed: "demo-high-risk",
    transactionSeed: "late-high-risk",
    facts: [
      { ageDays: 1, eventType: "LATE_PAYMENT", amount: 2000, sourceBlockOffset: 20, verificationOffset: 2 },
      { ageDays: 2, eventType: "REPAYMENT", amount: 1100, sourceBlockOffset: 25, verificationOffset: 3 },
      { ageDays: 3, eventType: "COLLATERAL_DEPOSIT", amount: 900, sourceBlockOffset: 28, verificationOffset: 3 },
    ],
    expected: { riskTier: "D", offerStatus: "Blocked", proofFallback: false },
  }),
  "sparse-evidence": profile({
    id: "sparse-evidence",
    label: "Sparse evidence",
    description: "A wallet with too little verified history to support a strong decision.",
    chain: "Ethereum Sepolia",
    walletSeed: "demo-sparse",
    transactionSeed: "single-repayment",
    facts: [{ ageDays: 2, eventType: "REPAYMENT", amount: 500, sourceBlockOffset: 30, verificationOffset: 3 }],
    expected: { riskTier: "B", offerStatus: "Ready", proofFallback: false },
  }),
  "fresh-repayment": profile({
    id: "fresh-repayment",
    label: "Fresh repayment",
    description: "Recent repayment intended to demonstrate freshness-aware underwriting.",
    chain: "Ethereum Sepolia",
    walletSeed: "demo-fresh",
    transactionSeed: "fresh-repayment",
    facts: [
      { ageDays: 0.05, eventType: "REPAYMENT", amount: 3000, sourceBlockOffset: 2, verificationOffset: 1 },
      { ageDays: 1, eventType: "COLLATERAL_DEPOSIT", amount: 5000, sourceBlockOffset: 4, verificationOffset: 1 },
    ],
    expected: { riskTier: "A", offerStatus: "Ready", proofFallback: false },
  }),
  "late-payment": profile({
    id: "late-payment",
    label: "Late payment",
    description: "Single negative event that should be visible in explanations.",
    chain: "Ethereum Sepolia",
    walletSeed: "demo-late",
    transactionSeed: "late-payment",
    facts: [
      { ageDays: 1, eventType: "LATE_PAYMENT", amount: 800, sourceBlockOffset: 3, verificationOffset: 2 },
      { ageDays: 14, eventType: "COLLATERAL_DEPOSIT", amount: 5000, sourceBlockOffset: 80, verificationOffset: 4 },
    ],
    expected: { riskTier: "C", offerStatus: "Ready", proofFallback: false },
  }),
  "stale-evidence": profile({
    id: "stale-evidence",
    label: "Stale evidence",
    description: "Older evidence demonstrates a low-freshness scenario.",
    chain: "Ethereum Sepolia",
    walletSeed: "demo-stale",
    transactionSeed: "stale-history",
    facts: [
      { ageDays: 180, eventType: "REPAYMENT", amount: 2200, sourceBlockOffset: 8000, verificationOffset: 20, freshness: "Stale" },
      { ageDays: 220, eventType: "COLLATERAL_DEPOSIT", amount: 7000, sourceBlockOffset: 9500, verificationOffset: 20, freshness: "Stale" },
    ],
    expected: { proofFallback: false },
  }),
  "cross-chain-history": profile({
    id: "cross-chain-history",
    label: "Cross-chain history",
    description: "Demo-only mixed activity scenario used to visualize cross-chain evidence.",
    chain: "Ethereum Sepolia",
    walletSeed: "demo-cross-chain",
    transactionSeed: "cross-chain",
    facts: [
      { ageDays: 2, eventType: "REPAYMENT", amount: 2200, sourceBlockOffset: 20, verificationOffset: 2 },
      { ageDays: 6, eventType: "COLLATERAL_DEPOSIT", amount: 7500, sourceBlockOffset: 50, verificationOffset: 3 },
      { ageDays: 17, eventType: "REPAYMENT", amount: 1600, sourceBlockOffset: 210, verificationOffset: 5 },
      { ageDays: 40, eventType: "REPAYMENT", amount: 900, sourceBlockOffset: 510, verificationOffset: 6 },
    ],
    expected: { riskTier: "A", offerStatus: "Ready", proofFallback: false },
  }),
  "operator-down": profile({
    id: "operator-down",
    label: "Attestor operator unavailable",
    description: "Simulates an unavailable attestation operator for fallback testing.",
    chain: "Ethereum Sepolia",
    walletSeed: "demo-operator-down",
    transactionSeed: "operator-down",
    facts: [
      { ageDays: 2, eventType: "REPAYMENT", amount: 1500, sourceBlockOffset: 22, verificationOffset: 3 },
      { ageDays: 7, eventType: "COLLATERAL_DEPOSIT", amount: 4000, sourceBlockOffset: 71, verificationOffset: 4 },
    ],
    expected: { proofFallback: true },
  }),
  "proof-builder-down": profile({
    id: "proof-builder-down",
    label: "Proof Builder unavailable",
    description: "Simulates Proof Builder failure while keeping the demo deterministic.",
    chain: "Ethereum Sepolia",
    walletSeed: "demo-proof-builder-down",
    transactionSeed: "proof-builder-down",
    facts: [
      { ageDays: 1, eventType: "REPAYMENT", amount: 1400, sourceBlockOffset: 15, verificationOffset: 2 },
      { ageDays: 10, eventType: "COLLATERAL_DEPOSIT", amount: 4200, sourceBlockOffset: 90, verificationOffset: 4 },
    ],
    expected: { proofFallback: true },
  }),
  "database-offline": profile({
    id: "database-offline",
    label: "Database offline",
    description: "Preview-only profile for UI continuity when persistence is unavailable.",
    chain: "Ethereum Sepolia",
    walletSeed: "demo-db-offline",
    transactionSeed: "db-offline",
    facts: [{ ageDays: 3, eventType: "REPAYMENT", amount: 1200, sourceBlockOffset: 12, verificationOffset: 2 }],
    expected: { proofFallback: true },
  }),
  "riskguard-blocked": profile({
    id: "riskguard-blocked",
    label: "RiskGuard blocked",
    description: "Demo profile intended to show the final deterministic policy gate.",
    chain: "Ethereum Sepolia",
    walletSeed: "demo-riskguard",
    transactionSeed: "riskguard-blocked",
    facts: [
      { ageDays: 1, eventType: "LATE_PAYMENT", amount: 2500, sourceBlockOffset: 5, verificationOffset: 2 },
      { ageDays: 2, eventType: "LATE_PAYMENT", amount: 1800, sourceBlockOffset: 6, verificationOffset: 2 },
      { ageDays: 3, eventType: "COLLATERAL_DEPOSIT", amount: 700, sourceBlockOffset: 8, verificationOffset: 2 },
    ],
    expected: { riskTier: "D", offerStatus: "Blocked", proofFallback: false },
  }),
};

export function getDemoProfile(id: string): DemoProfile {
  const profileValue = DEMO_PROFILES[id as DemoProfileId];
  if (!profileValue) throw new DemoError("VALIDATION", `Unknown demo profile: ${id}`);
  return profileValue;
}

export function listDemoProfiles(): DemoProfile[] {
  return Object.values(DEMO_PROFILES);
}

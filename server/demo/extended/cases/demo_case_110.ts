import type { ExtendedScenarioCase } from "../types";

export const demoCase110: ExtendedScenarioCase = {
  id: "extended-110",
  label: "Extended mock case 110 — policy rejection",
  kind: "riskguard-block",
  description: "Deterministic demo scenario for policy rejection; no live-chain assertion is made.",
  walletSeed: "extended-wallet-110",
  transactionSeed: "extended-tx-110",
  chain: "Ethereum Mainnet",
  facts: [
      { ageDays: 110, eventType: "LATE_PAYMENT", amount: 2523, sourceBlockOffset: 1100, verificationOffset: 1, freshness: "Stale" },
      { ageDays: 117, eventType: "COLLATERAL_DEPOSIT", amount: 2627, sourceBlockOffset: 1113, verificationOffset: 2, freshness: "Stale" },
      { ageDays: 124, eventType: "REPAYMENT", amount: 2730, sourceBlockOffset: 1126, verificationOffset: 3, freshness: "Stale" },
  ],
  expectations: {
    minEvidence: 3,
    freshness: undefined,
    requireFallback: false,
    allowOffer: false,
    requireAbstention: false,
    requirePolicyBlock: true,
  },
  tags: ["riskguard-block", "case-110", "ethereum-mainnet"],
};

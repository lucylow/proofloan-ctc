import type { ExtendedScenarioCase } from "../types";

export const demoCase026: ExtendedScenarioCase = {
  id: "extended-026",
  label: "Extended mock case 026 — policy rejection",
  kind: "riskguard-block",
  description: "Deterministic demo scenario for policy rejection; no live-chain assertion is made.",
  walletSeed: "extended-wallet-026",
  transactionSeed: "extended-tx-026",
  chain: "Ethereum Mainnet",
  facts: [
      { ageDays: 78, eventType: "LATE_PAYMENT", amount: 1354, sourceBlockOffset: 260, verificationOffset: 1, freshness: "Aging" },
      { ageDays: 85, eventType: "COLLATERAL_DEPOSIT", amount: 1457, sourceBlockOffset: 273, verificationOffset: 2, freshness: "Aging" },
      { ageDays: 92, eventType: "REPAYMENT", amount: 1561, sourceBlockOffset: 286, verificationOffset: 3, freshness: "Stale" },
  ],
  expectations: {
    minEvidence: 3,
    freshness: undefined,
    requireFallback: false,
    allowOffer: false,
    requireAbstention: false,
    requirePolicyBlock: true,
  },
  tags: ["riskguard-block", "case-026", "ethereum-mainnet"],
};

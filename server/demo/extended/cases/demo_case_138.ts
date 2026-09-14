import type { ExtendedScenarioCase } from "../types";

export const demoCase138: ExtendedScenarioCase = {
  id: "extended-138",
  label: "Extended mock case 138 — policy rejection",
  kind: "riskguard-block",
  description: "Deterministic demo scenario for policy rejection; no live-chain assertion is made.",
  walletSeed: "extended-wallet-138",
  transactionSeed: "extended-tx-138",
  chain: "Ethereum Mainnet",
  facts: [
      { ageDays: 194, eventType: "LATE_PAYMENT", amount: 1135, sourceBlockOffset: 1380, verificationOffset: 1, freshness: "Stale" },
      { ageDays: 201, eventType: "COLLATERAL_DEPOSIT", amount: 1239, sourceBlockOffset: 1393, verificationOffset: 2, freshness: "Stale" },
      { ageDays: 208, eventType: "REPAYMENT", amount: 1342, sourceBlockOffset: 1406, verificationOffset: 3, freshness: "Stale" },
  ],
  expectations: {
    minEvidence: 3,
    freshness: undefined,
    requireFallback: false,
    allowOffer: false,
    requireAbstention: false,
    requirePolicyBlock: true,
  },
  tags: ["riskguard-block", "case-138", "ethereum-mainnet"],
};

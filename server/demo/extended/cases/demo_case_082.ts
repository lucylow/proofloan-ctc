import type { ExtendedScenarioCase } from "../types";

export const demoCase082: ExtendedScenarioCase = {
  id: "extended-082",
  label: "Extended mock case 082 — policy rejection",
  kind: "riskguard-block",
  description: "Deterministic demo scenario for policy rejection; no live-chain assertion is made.",
  walletSeed: "extended-wallet-082",
  transactionSeed: "extended-tx-082",
  chain: "Ethereum Mainnet",
  facts: [
      { ageDays: 26, eventType: "LATE_PAYMENT", amount: 1244, sourceBlockOffset: 820, verificationOffset: 1, freshness: "Aging" },
      { ageDays: 33, eventType: "COLLATERAL_DEPOSIT", amount: 1348, sourceBlockOffset: 833, verificationOffset: 2, freshness: "Aging" },
      { ageDays: 40, eventType: "REPAYMENT", amount: 1452, sourceBlockOffset: 846, verificationOffset: 3, freshness: "Aging" },
  ],
  expectations: {
    minEvidence: 3,
    freshness: undefined,
    requireFallback: false,
    allowOffer: false,
    requireAbstention: false,
    requirePolicyBlock: true,
  },
  tags: ["riskguard-block", "case-082", "ethereum-mainnet"],
};

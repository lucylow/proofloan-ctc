import type { ExtendedScenarioCase } from "../types";

export const demoCase166: ExtendedScenarioCase = {
  id: "extended-166",
  label: "Extended mock case 166 — policy rejection",
  kind: "riskguard-block",
  description: "Deterministic demo scenario for policy rejection; no live-chain assertion is made.",
  walletSeed: "extended-wallet-166",
  transactionSeed: "extended-tx-166",
  chain: "Ethereum Mainnet",
  facts: [
      { ageDays: 58, eventType: "LATE_PAYMENT", amount: 2414, sourceBlockOffset: 1660, verificationOffset: 1, freshness: "Aging" },
      { ageDays: 65, eventType: "COLLATERAL_DEPOSIT", amount: 2517, sourceBlockOffset: 1673, verificationOffset: 2, freshness: "Aging" },
      { ageDays: 72, eventType: "REPAYMENT", amount: 2621, sourceBlockOffset: 1686, verificationOffset: 3, freshness: "Aging" },
  ],
  expectations: {
    minEvidence: 3,
    freshness: undefined,
    requireFallback: false,
    allowOffer: false,
    requireAbstention: false,
    requirePolicyBlock: true,
  },
  tags: ["riskguard-block", "case-166", "ethereum-mainnet"],
};

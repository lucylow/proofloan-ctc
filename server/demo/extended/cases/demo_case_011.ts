import type { ExtendedScenarioCase } from "../types";

export const demoCase011: ExtendedScenarioCase = {
  id: "extended-011",
  label: "Extended mock case 011 — model uncertainty",
  kind: "ai-abstain",
  description: "Deterministic demo scenario for model uncertainty; no live-chain assertion is made.",
  walletSeed: "extended-wallet-011",
  transactionSeed: "extended-tx-011",
  chain: "Ethereum Mainnet",
  facts: [
      { ageDays: 33, eventType: "REPAYMENT", amount: 2007, sourceBlockOffset: 110, verificationOffset: 1, freshness: "Aging" },
      { ageDays: 40, eventType: "COLLATERAL_DEPOSIT", amount: 2318, sourceBlockOffset: 123, verificationOffset: 2, freshness: "Aging" },
      { ageDays: 47, eventType: "REPAYMENT", amount: 2629, sourceBlockOffset: 136, verificationOffset: 3, freshness: "Aging" },
      { ageDays: 54, eventType: "REPAYMENT", amount: 2940, sourceBlockOffset: 149, verificationOffset: 4, freshness: "Aging" },
  ],
  expectations: {
    minEvidence: 4,
    freshness: undefined,
    requireFallback: false,
    allowOffer: false,
    requireAbstention: true,
    requirePolicyBlock: false,
  },
  tags: ["ai-abstain", "case-011", "ethereum-mainnet"],
};

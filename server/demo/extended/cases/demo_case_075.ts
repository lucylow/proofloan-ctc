import type { ExtendedScenarioCase } from "../types";

export const demoCase075: ExtendedScenarioCase = {
  id: "extended-075",
  label: "Extended mock case 075 — cross-chain history",
  kind: "cross-chain",
  description: "Deterministic demo scenario for cross-chain history; no live-chain assertion is made.",
  walletSeed: "extended-wallet-075",
  transactionSeed: "extended-tx-075",
  chain: "Ethereum Sepolia",
  facts: [
      { ageDays: 5, eventType: "REPAYMENT", amount: 2775, sourceBlockOffset: 750, verificationOffset: 1, freshness: "Fresh" },
      { ageDays: 12, eventType: "COLLATERAL_DEPOSIT", amount: 3086, sourceBlockOffset: 763, verificationOffset: 2, freshness: "Aging" },
      { ageDays: 19, eventType: "REPAYMENT", amount: 3397, sourceBlockOffset: 776, verificationOffset: 3, freshness: "Aging" },
      { ageDays: 26, eventType: "REPAYMENT", amount: 3708, sourceBlockOffset: 789, verificationOffset: 4, freshness: "Aging" },
  ],
  expectations: {
    minEvidence: 4,
    freshness: undefined,
    requireFallback: false,
    allowOffer: true,
    requireAbstention: false,
    requirePolicyBlock: false,
  },
  tags: ["cross-chain", "case-075", "ethereum-sepolia"],
};

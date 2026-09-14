import type { ExtendedScenarioCase } from "../types";

export const demoCase159: ExtendedScenarioCase = {
  id: "extended-159",
  label: "Extended mock case 159 — cross-chain history",
  kind: "cross-chain",
  description: "Deterministic demo scenario for cross-chain history; no live-chain assertion is made.",
  walletSeed: "extended-wallet-159",
  transactionSeed: "extended-tx-159",
  chain: "Ethereum Sepolia",
  facts: [
      { ageDays: 37, eventType: "REPAYMENT", amount: 6283, sourceBlockOffset: 1590, verificationOffset: 1, freshness: "Aging" },
      { ageDays: 44, eventType: "COLLATERAL_DEPOSIT", amount: 6594, sourceBlockOffset: 1603, verificationOffset: 2, freshness: "Aging" },
      { ageDays: 51, eventType: "REPAYMENT", amount: 6905, sourceBlockOffset: 1616, verificationOffset: 3, freshness: "Aging" },
      { ageDays: 58, eventType: "REPAYMENT", amount: 7216, sourceBlockOffset: 1629, verificationOffset: 4, freshness: "Aging" },
  ],
  expectations: {
    minEvidence: 4,
    freshness: undefined,
    requireFallback: false,
    allowOffer: true,
    requireAbstention: false,
    requirePolicyBlock: false,
  },
  tags: ["cross-chain", "case-159", "ethereum-sepolia"],
};

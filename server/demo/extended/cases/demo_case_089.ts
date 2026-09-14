import type { ExtendedScenarioCase } from "../types";

export const demoCase089: ExtendedScenarioCase = {
  id: "extended-089",
  label: "Extended mock case 089 — cross-chain history",
  kind: "cross-chain",
  description: "Deterministic demo scenario for cross-chain history; no live-chain assertion is made.",
  walletSeed: "extended-wallet-089",
  transactionSeed: "extended-tx-089",
  chain: "Ethereum Sepolia",
  facts: [
      { ageDays: 47, eventType: "REPAYMENT", amount: 4693, sourceBlockOffset: 890, verificationOffset: 1, freshness: "Aging" },
      { ageDays: 54, eventType: "COLLATERAL_DEPOSIT", amount: 5004, sourceBlockOffset: 903, verificationOffset: 2, freshness: "Aging" },
  ],
  expectations: {
    minEvidence: 2,
    freshness: undefined,
    requireFallback: false,
    allowOffer: true,
    requireAbstention: false,
    requirePolicyBlock: false,
  },
  tags: ["cross-chain", "case-089", "ethereum-sepolia"],
};

import type { ExtendedScenarioCase } from "../types";

export const demoCase005: ExtendedScenarioCase = {
  id: "extended-005",
  label: "Extended mock case 005 — cross-chain history",
  kind: "cross-chain",
  description: "Deterministic demo scenario for cross-chain history; no live-chain assertion is made.",
  walletSeed: "extended-wallet-005",
  transactionSeed: "extended-tx-005",
  chain: "Ethereum Sepolia",
  facts: [
      { ageDays: 15, eventType: "REPAYMENT", amount: 1185, sourceBlockOffset: 50, verificationOffset: 1, freshness: "Aging" },
      { ageDays: 22, eventType: "COLLATERAL_DEPOSIT", amount: 1496, sourceBlockOffset: 63, verificationOffset: 2, freshness: "Aging" },
  ],
  expectations: {
    minEvidence: 2,
    freshness: undefined,
    requireFallback: false,
    allowOffer: true,
    requireAbstention: false,
    requirePolicyBlock: false,
  },
  tags: ["cross-chain", "case-005", "ethereum-sepolia"],
};

import type { ExtendedScenarioCase } from "../types";

export const demoCase019: ExtendedScenarioCase = {
  id: "extended-019",
  label: "Extended mock case 019 — cross-chain history",
  kind: "cross-chain",
  description: "Deterministic demo scenario for cross-chain history; no live-chain assertion is made.",
  walletSeed: "extended-wallet-019",
  transactionSeed: "extended-tx-019",
  chain: "Ethereum Sepolia",
  facts: [
      { ageDays: 57, eventType: "REPAYMENT", amount: 3103, sourceBlockOffset: 190, verificationOffset: 1, freshness: "Aging" },
      { ageDays: 64, eventType: "COLLATERAL_DEPOSIT", amount: 3414, sourceBlockOffset: 203, verificationOffset: 2, freshness: "Aging" },
      { ageDays: 71, eventType: "REPAYMENT", amount: 3725, sourceBlockOffset: 216, verificationOffset: 3, freshness: "Aging" },
      { ageDays: 78, eventType: "REPAYMENT", amount: 4036, sourceBlockOffset: 229, verificationOffset: 4, freshness: "Aging" },
  ],
  expectations: {
    minEvidence: 4,
    freshness: undefined,
    requireFallback: false,
    allowOffer: true,
    requireAbstention: false,
    requirePolicyBlock: false,
  },
  tags: ["cross-chain", "case-019", "ethereum-sepolia"],
};

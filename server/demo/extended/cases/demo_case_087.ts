import type { ExtendedScenarioCase } from "../types";

export const demoCase087: ExtendedScenarioCase = {
  id: "extended-087",
  label: "Extended mock case 087 — late payment",
  kind: "late-payment",
  description: "Deterministic demo scenario for late payment; no live-chain assertion is made.",
  walletSeed: "extended-wallet-087",
  transactionSeed: "extended-tx-087",
  chain: "Ethereum Sepolia",
  facts: [
      { ageDays: 41, eventType: "LATE_PAYMENT", amount: 4419, sourceBlockOffset: 870, verificationOffset: 1, freshness: "Aging" },
      { ageDays: 48, eventType: "COLLATERAL_DEPOSIT", amount: 4730, sourceBlockOffset: 883, verificationOffset: 2, freshness: "Aging" },
      { ageDays: 55, eventType: "REPAYMENT", amount: 5041, sourceBlockOffset: 896, verificationOffset: 3, freshness: "Aging" },
      { ageDays: 62, eventType: "REPAYMENT", amount: 5352, sourceBlockOffset: 909, verificationOffset: 4, freshness: "Aging" },
  ],
  expectations: {
    minEvidence: 4,
    freshness: undefined,
    requireFallback: false,
    allowOffer: true,
    requireAbstention: false,
    requirePolicyBlock: false,
  },
  tags: ["late-payment", "case-087", "ethereum-sepolia"],
};

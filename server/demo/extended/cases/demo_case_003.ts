import type { ExtendedScenarioCase } from "../types";

export const demoCase003: ExtendedScenarioCase = {
  id: "extended-003",
  label: "Extended mock case 003 — late payment",
  kind: "late-payment",
  description: "Deterministic demo scenario for late payment; no live-chain assertion is made.",
  walletSeed: "extended-wallet-003",
  transactionSeed: "extended-tx-003",
  chain: "Ethereum Sepolia",
  facts: [
      { ageDays: 9, eventType: "LATE_PAYMENT", amount: 911, sourceBlockOffset: 30, verificationOffset: 1, freshness: "Aging" },
      { ageDays: 16, eventType: "COLLATERAL_DEPOSIT", amount: 1222, sourceBlockOffset: 43, verificationOffset: 2, freshness: "Aging" },
      { ageDays: 23, eventType: "REPAYMENT", amount: 1533, sourceBlockOffset: 56, verificationOffset: 3, freshness: "Aging" },
      { ageDays: 30, eventType: "REPAYMENT", amount: 1844, sourceBlockOffset: 69, verificationOffset: 4, freshness: "Aging" },
  ],
  expectations: {
    minEvidence: 4,
    freshness: undefined,
    requireFallback: false,
    allowOffer: true,
    requireAbstention: false,
    requirePolicyBlock: false,
  },
  tags: ["late-payment", "case-003", "ethereum-sepolia"],
};

import type { ExtendedScenarioCase } from "../types";

export const demoCase101: ExtendedScenarioCase = {
  id: "extended-101",
  label: "Extended mock case 101 — late payment",
  kind: "late-payment",
  description: "Deterministic demo scenario for late payment; no live-chain assertion is made.",
  walletSeed: "extended-wallet-101",
  transactionSeed: "extended-tx-101",
  chain: "Ethereum Sepolia",
  facts: [
      { ageDays: 83, eventType: "LATE_PAYMENT", amount: 6337, sourceBlockOffset: 1010, verificationOffset: 1, freshness: "Aging" },
      { ageDays: 90, eventType: "COLLATERAL_DEPOSIT", amount: 6648, sourceBlockOffset: 1023, verificationOffset: 2, freshness: "Aging" },
  ],
  expectations: {
    minEvidence: 2,
    freshness: undefined,
    requireFallback: false,
    allowOffer: true,
    requireAbstention: false,
    requirePolicyBlock: false,
  },
  tags: ["late-payment", "case-101", "ethereum-sepolia"],
};

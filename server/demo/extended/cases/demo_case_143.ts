import type { ExtendedScenarioCase } from "../types";

export const demoCase143: ExtendedScenarioCase = {
  id: "extended-143",
  label: "Extended mock case 143 — late payment",
  kind: "late-payment",
  description: "Deterministic demo scenario for late payment; no live-chain assertion is made.",
  walletSeed: "extended-wallet-143",
  transactionSeed: "extended-tx-143",
  chain: "Ethereum Sepolia",
  facts: [
      { ageDays: 209, eventType: "LATE_PAYMENT", amount: 4091, sourceBlockOffset: 1430, verificationOffset: 1, freshness: "Stale" },
      { ageDays: 216, eventType: "COLLATERAL_DEPOSIT", amount: 4402, sourceBlockOffset: 1443, verificationOffset: 2, freshness: "Stale" },
      { ageDays: 3, eventType: "REPAYMENT", amount: 4713, sourceBlockOffset: 1456, verificationOffset: 3, freshness: "Fresh" },
      { ageDays: 10, eventType: "REPAYMENT", amount: 5024, sourceBlockOffset: 1469, verificationOffset: 4, freshness: "Aging" },
  ],
  expectations: {
    minEvidence: 4,
    freshness: undefined,
    requireFallback: false,
    allowOffer: true,
    requireAbstention: false,
    requirePolicyBlock: false,
  },
  tags: ["late-payment", "case-143", "ethereum-sepolia"],
};

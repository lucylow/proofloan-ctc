import type { ExtendedScenarioCase } from "../types";

export const demoCase115: ExtendedScenarioCase = {
  id: "extended-115",
  label: "Extended mock case 115 — late payment",
  kind: "late-payment",
  description: "Deterministic demo scenario for late payment; no live-chain assertion is made.",
  walletSeed: "extended-wallet-115",
  transactionSeed: "extended-tx-115",
  chain: "Ethereum Sepolia",
  facts: [
      { ageDays: 125, eventType: "LATE_PAYMENT", amount: 8255, sourceBlockOffset: 1150, verificationOffset: 1, freshness: "Stale" },
      { ageDays: 132, eventType: "COLLATERAL_DEPOSIT", amount: 566, sourceBlockOffset: 1163, verificationOffset: 2, freshness: "Stale" },
      { ageDays: 139, eventType: "REPAYMENT", amount: 877, sourceBlockOffset: 1176, verificationOffset: 3, freshness: "Stale" },
      { ageDays: 146, eventType: "REPAYMENT", amount: 1188, sourceBlockOffset: 1189, verificationOffset: 4, freshness: "Stale" },
  ],
  expectations: {
    minEvidence: 4,
    freshness: undefined,
    requireFallback: false,
    allowOffer: true,
    requireAbstention: false,
    requirePolicyBlock: false,
  },
  tags: ["late-payment", "case-115", "ethereum-sepolia"],
};

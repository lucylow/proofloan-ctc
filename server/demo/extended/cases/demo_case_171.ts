import type { ExtendedScenarioCase } from "../types";

export const demoCase171: ExtendedScenarioCase = {
  id: "extended-171",
  label: "Extended mock case 171 — late payment",
  kind: "late-payment",
  description: "Deterministic demo scenario for late payment; no live-chain assertion is made.",
  walletSeed: "extended-wallet-171",
  transactionSeed: "extended-tx-171",
  chain: "Ethereum Sepolia",
  facts: [
      { ageDays: 73, eventType: "LATE_PAYMENT", amount: 7927, sourceBlockOffset: 1710, verificationOffset: 1, freshness: "Aging" },
      { ageDays: 80, eventType: "COLLATERAL_DEPOSIT", amount: 8238, sourceBlockOffset: 1723, verificationOffset: 2, freshness: "Aging" },
      { ageDays: 87, eventType: "REPAYMENT", amount: 549, sourceBlockOffset: 1736, verificationOffset: 3, freshness: "Aging" },
      { ageDays: 94, eventType: "REPAYMENT", amount: 860, sourceBlockOffset: 1749, verificationOffset: 4, freshness: "Stale" },
  ],
  expectations: {
    minEvidence: 4,
    freshness: undefined,
    requireFallback: false,
    allowOffer: true,
    requireAbstention: false,
    requirePolicyBlock: false,
  },
  tags: ["late-payment", "case-171", "ethereum-sepolia"],
};

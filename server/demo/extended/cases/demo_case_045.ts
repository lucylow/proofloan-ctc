import type { ExtendedScenarioCase } from "../types";

export const demoCase045: ExtendedScenarioCase = {
  id: "extended-045",
  label: "Extended mock case 045 — late payment",
  kind: "late-payment",
  description: "Deterministic demo scenario for late payment; no live-chain assertion is made.",
  walletSeed: "extended-wallet-045",
  transactionSeed: "extended-tx-045",
  chain: "Ethereum Sepolia",
  facts: [
      { ageDays: 135, eventType: "LATE_PAYMENT", amount: 6665, sourceBlockOffset: 450, verificationOffset: 1, freshness: "Stale" },
      { ageDays: 142, eventType: "COLLATERAL_DEPOSIT", amount: 6976, sourceBlockOffset: 463, verificationOffset: 2, freshness: "Stale" },
  ],
  expectations: {
    minEvidence: 2,
    freshness: undefined,
    requireFallback: false,
    allowOffer: true,
    requireAbstention: false,
    requirePolicyBlock: false,
  },
  tags: ["late-payment", "case-045", "ethereum-sepolia"],
};

import type { ExtendedScenarioCase } from "../types";

export const demoCase017: ExtendedScenarioCase = {
  id: "extended-017",
  label: "Extended mock case 017 — late payment",
  kind: "late-payment",
  description: "Deterministic demo scenario for late payment; no live-chain assertion is made.",
  walletSeed: "extended-wallet-017",
  transactionSeed: "extended-tx-017",
  chain: "Ethereum Sepolia",
  facts: [
      { ageDays: 51, eventType: "LATE_PAYMENT", amount: 2829, sourceBlockOffset: 170, verificationOffset: 1, freshness: "Aging" },
      { ageDays: 58, eventType: "COLLATERAL_DEPOSIT", amount: 3140, sourceBlockOffset: 183, verificationOffset: 2, freshness: "Aging" },
  ],
  expectations: {
    minEvidence: 2,
    freshness: undefined,
    requireFallback: false,
    allowOffer: true,
    requireAbstention: false,
    requirePolicyBlock: false,
  },
  tags: ["late-payment", "case-017", "ethereum-sepolia"],
};

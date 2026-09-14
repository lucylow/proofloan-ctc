import type { ExtendedScenarioCase } from "../types";

export const demoCase157: ExtendedScenarioCase = {
  id: "extended-157",
  label: "Extended mock case 157 — late payment",
  kind: "late-payment",
  description: "Deterministic demo scenario for late payment; no live-chain assertion is made.",
  walletSeed: "extended-wallet-157",
  transactionSeed: "extended-tx-157",
  chain: "Ethereum Sepolia",
  facts: [
      { ageDays: 31, eventType: "LATE_PAYMENT", amount: 6009, sourceBlockOffset: 1570, verificationOffset: 1, freshness: "Aging" },
      { ageDays: 38, eventType: "COLLATERAL_DEPOSIT", amount: 6320, sourceBlockOffset: 1583, verificationOffset: 2, freshness: "Aging" },
  ],
  expectations: {
    minEvidence: 2,
    freshness: undefined,
    requireFallback: false,
    allowOffer: true,
    requireAbstention: false,
    requirePolicyBlock: false,
  },
  tags: ["late-payment", "case-157", "ethereum-sepolia"],
};

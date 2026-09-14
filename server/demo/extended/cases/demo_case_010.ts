import type { ExtendedScenarioCase } from "../types";

export const demoCase010: ExtendedScenarioCase = {
  id: "extended-010",
  label: "Extended mock case 010 — dense transaction block",
  kind: "merkle-pressure",
  description: "Deterministic demo scenario for dense transaction block; no live-chain assertion is made.",
  walletSeed: "extended-wallet-010",
  transactionSeed: "extended-tx-010",
  chain: "Ethereum Mainnet",
  facts: [
      { ageDays: 30, eventType: "REPAYMENT", amount: 1870, sourceBlockOffset: 100, verificationOffset: 1, freshness: "Aging" },
      { ageDays: 37, eventType: "COLLATERAL_DEPOSIT", amount: 2181, sourceBlockOffset: 113, verificationOffset: 2, freshness: "Aging" },
      { ageDays: 44, eventType: "REPAYMENT", amount: 2492, sourceBlockOffset: 126, verificationOffset: 3, freshness: "Aging" },
  ],
  expectations: {
    minEvidence: 3,
    freshness: undefined,
    requireFallback: false,
    allowOffer: true,
    requireAbstention: false,
    requirePolicyBlock: false,
  },
  tags: ["merkle-pressure", "case-010", "ethereum-mainnet"],
};

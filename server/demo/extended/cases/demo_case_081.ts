import type { ExtendedScenarioCase } from "../types";

export const demoCase081: ExtendedScenarioCase = {
  id: "extended-081",
  label: "Extended mock case 081 — model uncertainty",
  kind: "ai-abstain",
  description: "Deterministic demo scenario for model uncertainty; no live-chain assertion is made.",
  walletSeed: "extended-wallet-081",
  transactionSeed: "extended-tx-081",
  chain: "Ethereum Mainnet",
  facts: [
      { ageDays: 23, eventType: "REPAYMENT", amount: 3597, sourceBlockOffset: 810, verificationOffset: 1, freshness: "Aging" },
      { ageDays: 30, eventType: "COLLATERAL_DEPOSIT", amount: 3908, sourceBlockOffset: 823, verificationOffset: 2, freshness: "Aging" },
  ],
  expectations: {
    minEvidence: 2,
    freshness: undefined,
    requireFallback: false,
    allowOffer: false,
    requireAbstention: true,
    requirePolicyBlock: false,
  },
  tags: ["ai-abstain", "case-081", "ethereum-mainnet"],
};

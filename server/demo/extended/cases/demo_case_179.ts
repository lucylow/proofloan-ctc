import type { ExtendedScenarioCase } from "../types";

export const demoCase179: ExtendedScenarioCase = {
  id: "extended-179",
  label: "Extended mock case 179 — model uncertainty",
  kind: "ai-abstain",
  description: "Deterministic demo scenario for model uncertainty; no live-chain assertion is made.",
  walletSeed: "extended-wallet-179",
  transactionSeed: "extended-tx-179",
  chain: "Ethereum Mainnet",
  facts: [
      { ageDays: 97, eventType: "REPAYMENT", amount: 1023, sourceBlockOffset: 1790, verificationOffset: 1, freshness: "Stale" },
      { ageDays: 104, eventType: "COLLATERAL_DEPOSIT", amount: 1334, sourceBlockOffset: 1803, verificationOffset: 2, freshness: "Stale" },
      { ageDays: 111, eventType: "REPAYMENT", amount: 1645, sourceBlockOffset: 1816, verificationOffset: 3, freshness: "Stale" },
      { ageDays: 118, eventType: "REPAYMENT", amount: 1956, sourceBlockOffset: 1829, verificationOffset: 4, freshness: "Stale" },
  ],
  expectations: {
    minEvidence: 4,
    freshness: undefined,
    requireFallback: false,
    allowOffer: false,
    requireAbstention: true,
    requirePolicyBlock: false,
  },
  tags: ["ai-abstain", "case-179", "ethereum-mainnet"],
};

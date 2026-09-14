import type { ExtendedScenarioCase } from "../types";

export const demoCase039: ExtendedScenarioCase = {
  id: "extended-039",
  label: "Extended mock case 039 — model uncertainty",
  kind: "ai-abstain",
  description: "Deterministic demo scenario for model uncertainty; no live-chain assertion is made.",
  walletSeed: "extended-wallet-039",
  transactionSeed: "extended-tx-039",
  chain: "Ethereum Mainnet",
  facts: [
      { ageDays: 117, eventType: "REPAYMENT", amount: 5843, sourceBlockOffset: 390, verificationOffset: 1, freshness: "Stale" },
      { ageDays: 124, eventType: "COLLATERAL_DEPOSIT", amount: 6154, sourceBlockOffset: 403, verificationOffset: 2, freshness: "Stale" },
      { ageDays: 131, eventType: "REPAYMENT", amount: 6465, sourceBlockOffset: 416, verificationOffset: 3, freshness: "Stale" },
      { ageDays: 138, eventType: "REPAYMENT", amount: 6776, sourceBlockOffset: 429, verificationOffset: 4, freshness: "Stale" },
  ],
  expectations: {
    minEvidence: 4,
    freshness: undefined,
    requireFallback: false,
    allowOffer: false,
    requireAbstention: true,
    requirePolicyBlock: false,
  },
  tags: ["ai-abstain", "case-039", "ethereum-mainnet"],
};

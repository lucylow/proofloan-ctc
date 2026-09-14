import type { ExtendedScenarioCase } from "../types";

export const demoCase151: ExtendedScenarioCase = {
  id: "extended-151",
  label: "Extended mock case 151 — model uncertainty",
  kind: "ai-abstain",
  description: "Deterministic demo scenario for model uncertainty; no live-chain assertion is made.",
  walletSeed: "extended-wallet-151",
  transactionSeed: "extended-tx-151",
  chain: "Ethereum Mainnet",
  facts: [
      { ageDays: 13, eventType: "REPAYMENT", amount: 5187, sourceBlockOffset: 1510, verificationOffset: 1, freshness: "Aging" },
      { ageDays: 20, eventType: "COLLATERAL_DEPOSIT", amount: 5498, sourceBlockOffset: 1523, verificationOffset: 2, freshness: "Aging" },
      { ageDays: 27, eventType: "REPAYMENT", amount: 5809, sourceBlockOffset: 1536, verificationOffset: 3, freshness: "Aging" },
      { ageDays: 34, eventType: "REPAYMENT", amount: 6120, sourceBlockOffset: 1549, verificationOffset: 4, freshness: "Aging" },
  ],
  expectations: {
    minEvidence: 4,
    freshness: undefined,
    requireFallback: false,
    allowOffer: false,
    requireAbstention: true,
    requirePolicyBlock: false,
  },
  tags: ["ai-abstain", "case-151", "ethereum-mainnet"],
};

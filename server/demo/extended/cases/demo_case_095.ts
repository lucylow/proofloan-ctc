import type { ExtendedScenarioCase } from "../types";

export const demoCase095: ExtendedScenarioCase = {
  id: "extended-095",
  label: "Extended mock case 095 — model uncertainty",
  kind: "ai-abstain",
  description: "Deterministic demo scenario for model uncertainty; no live-chain assertion is made.",
  walletSeed: "extended-wallet-095",
  transactionSeed: "extended-tx-095",
  chain: "Ethereum Mainnet",
  facts: [
      { ageDays: 65, eventType: "REPAYMENT", amount: 5515, sourceBlockOffset: 950, verificationOffset: 1, freshness: "Aging" },
      { ageDays: 72, eventType: "COLLATERAL_DEPOSIT", amount: 5826, sourceBlockOffset: 963, verificationOffset: 2, freshness: "Aging" },
      { ageDays: 79, eventType: "REPAYMENT", amount: 6137, sourceBlockOffset: 976, verificationOffset: 3, freshness: "Aging" },
      { ageDays: 86, eventType: "REPAYMENT", amount: 6448, sourceBlockOffset: 989, verificationOffset: 4, freshness: "Aging" },
  ],
  expectations: {
    minEvidence: 4,
    freshness: undefined,
    requireFallback: false,
    allowOffer: false,
    requireAbstention: true,
    requirePolicyBlock: false,
  },
  tags: ["ai-abstain", "case-095", "ethereum-mainnet"],
};

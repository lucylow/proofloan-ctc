import type { ExtendedScenarioCase } from "../types";

export const demoCase165: ExtendedScenarioCase = {
  id: "extended-165",
  label: "Extended mock case 165 — model uncertainty",
  kind: "ai-abstain",
  description: "Deterministic demo scenario for model uncertainty; no live-chain assertion is made.",
  walletSeed: "extended-wallet-165",
  transactionSeed: "extended-tx-165",
  chain: "Ethereum Mainnet",
  facts: [
      { ageDays: 55, eventType: "REPAYMENT", amount: 7105, sourceBlockOffset: 1650, verificationOffset: 1, freshness: "Aging" },
      { ageDays: 62, eventType: "COLLATERAL_DEPOSIT", amount: 7416, sourceBlockOffset: 1663, verificationOffset: 2, freshness: "Aging" },
  ],
  expectations: {
    minEvidence: 2,
    freshness: undefined,
    requireFallback: false,
    allowOffer: false,
    requireAbstention: true,
    requirePolicyBlock: false,
  },
  tags: ["ai-abstain", "case-165", "ethereum-mainnet"],
};

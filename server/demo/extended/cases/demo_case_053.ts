import type { ExtendedScenarioCase } from "../types";

export const demoCase053: ExtendedScenarioCase = {
  id: "extended-053",
  label: "Extended mock case 053 — model uncertainty",
  kind: "ai-abstain",
  description: "Deterministic demo scenario for model uncertainty; no live-chain assertion is made.",
  walletSeed: "extended-wallet-053",
  transactionSeed: "extended-tx-053",
  chain: "Ethereum Mainnet",
  facts: [
      { ageDays: 159, eventType: "REPAYMENT", amount: 7761, sourceBlockOffset: 530, verificationOffset: 1, freshness: "Stale" },
      { ageDays: 166, eventType: "COLLATERAL_DEPOSIT", amount: 8072, sourceBlockOffset: 543, verificationOffset: 2, freshness: "Stale" },
  ],
  expectations: {
    minEvidence: 2,
    freshness: undefined,
    requireFallback: false,
    allowOffer: false,
    requireAbstention: true,
    requirePolicyBlock: false,
  },
  tags: ["ai-abstain", "case-053", "ethereum-mainnet"],
};

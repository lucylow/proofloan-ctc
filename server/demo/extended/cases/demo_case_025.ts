import type { ExtendedScenarioCase } from "../types";

export const demoCase025: ExtendedScenarioCase = {
  id: "extended-025",
  label: "Extended mock case 025 — model uncertainty",
  kind: "ai-abstain",
  description: "Deterministic demo scenario for model uncertainty; no live-chain assertion is made.",
  walletSeed: "extended-wallet-025",
  transactionSeed: "extended-tx-025",
  chain: "Ethereum Mainnet",
  facts: [
      { ageDays: 75, eventType: "REPAYMENT", amount: 3925, sourceBlockOffset: 250, verificationOffset: 1, freshness: "Aging" },
      { ageDays: 82, eventType: "COLLATERAL_DEPOSIT", amount: 4236, sourceBlockOffset: 263, verificationOffset: 2, freshness: "Aging" },
  ],
  expectations: {
    minEvidence: 2,
    freshness: undefined,
    requireFallback: false,
    allowOffer: false,
    requireAbstention: true,
    requirePolicyBlock: false,
  },
  tags: ["ai-abstain", "case-025", "ethereum-mainnet"],
};

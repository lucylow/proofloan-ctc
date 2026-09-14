import type { ExtendedScenarioCase } from "../types";

export const demoCase109: ExtendedScenarioCase = {
  id: "extended-109",
  label: "Extended mock case 109 — model uncertainty",
  kind: "ai-abstain",
  description: "Deterministic demo scenario for model uncertainty; no live-chain assertion is made.",
  walletSeed: "extended-wallet-109",
  transactionSeed: "extended-tx-109",
  chain: "Ethereum Mainnet",
  facts: [
      { ageDays: 107, eventType: "REPAYMENT", amount: 7433, sourceBlockOffset: 1090, verificationOffset: 1, freshness: "Stale" },
      { ageDays: 114, eventType: "COLLATERAL_DEPOSIT", amount: 7744, sourceBlockOffset: 1103, verificationOffset: 2, freshness: "Stale" },
  ],
  expectations: {
    minEvidence: 2,
    freshness: undefined,
    requireFallback: false,
    allowOffer: false,
    requireAbstention: true,
    requirePolicyBlock: false,
  },
  tags: ["ai-abstain", "case-109", "ethereum-mainnet"],
};

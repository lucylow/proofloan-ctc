import type { ExtendedScenarioCase } from "../types";

export const demoCase123: ExtendedScenarioCase = {
  id: "extended-123",
  label: "Extended mock case 123 — model uncertainty",
  kind: "ai-abstain",
  description: "Deterministic demo scenario for model uncertainty; no live-chain assertion is made.",
  walletSeed: "extended-wallet-123",
  transactionSeed: "extended-tx-123",
  chain: "Ethereum Mainnet",
  facts: [
      { ageDays: 149, eventType: "REPAYMENT", amount: 1351, sourceBlockOffset: 1230, verificationOffset: 1, freshness: "Stale" },
      { ageDays: 156, eventType: "COLLATERAL_DEPOSIT", amount: 1662, sourceBlockOffset: 1243, verificationOffset: 2, freshness: "Stale" },
      { ageDays: 163, eventType: "REPAYMENT", amount: 1973, sourceBlockOffset: 1256, verificationOffset: 3, freshness: "Stale" },
      { ageDays: 170, eventType: "REPAYMENT", amount: 2284, sourceBlockOffset: 1269, verificationOffset: 4, freshness: "Stale" },
  ],
  expectations: {
    minEvidence: 4,
    freshness: undefined,
    requireFallback: false,
    allowOffer: false,
    requireAbstention: true,
    requirePolicyBlock: false,
  },
  tags: ["ai-abstain", "case-123", "ethereum-mainnet"],
};

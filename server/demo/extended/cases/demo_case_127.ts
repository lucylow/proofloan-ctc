import type { ExtendedScenarioCase } from "../types";

export const demoCase127: ExtendedScenarioCase = {
  id: "extended-127",
  label: "Extended mock case 127 — stable repayment",
  kind: "happy-path",
  description: "Deterministic demo scenario for stable repayment; no live-chain assertion is made.",
  walletSeed: "extended-wallet-127",
  transactionSeed: "extended-tx-127",
  chain: "Ethereum Sepolia",
  facts: [
      { ageDays: 161, eventType: "REPAYMENT", amount: 1899, sourceBlockOffset: 1270, verificationOffset: 1, freshness: "Stale" },
      { ageDays: 168, eventType: "COLLATERAL_DEPOSIT", amount: 2210, sourceBlockOffset: 1283, verificationOffset: 2, freshness: "Stale" },
      { ageDays: 175, eventType: "REPAYMENT", amount: 2521, sourceBlockOffset: 1296, verificationOffset: 3, freshness: "Stale" },
      { ageDays: 182, eventType: "REPAYMENT", amount: 2832, sourceBlockOffset: 1309, verificationOffset: 4, freshness: "Stale" },
  ],
  expectations: {
    minEvidence: 4,
    freshness: undefined,
    requireFallback: false,
    allowOffer: true,
    requireAbstention: false,
    requirePolicyBlock: false,
  },
  tags: ["happy-path", "case-127", "ethereum-sepolia"],
};

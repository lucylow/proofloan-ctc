import type { ExtendedScenarioCase } from "../types";

export const demoCase002: ExtendedScenarioCase = {
  id: "extended-002",
  label: "Extended mock case 002 — fresh evidence",
  kind: "freshness",
  description: "Deterministic demo scenario for fresh evidence; no live-chain assertion is made.",
  walletSeed: "extended-wallet-002",
  transactionSeed: "extended-tx-002",
  chain: "Ethereum Sepolia",
  facts: [
      { ageDays: 0.05, eventType: "REPAYMENT", amount: 774, sourceBlockOffset: 20, verificationOffset: 1, freshness: "Fresh" },
      { ageDays: 1.05, eventType: "COLLATERAL_DEPOSIT", amount: 1085, sourceBlockOffset: 33, verificationOffset: 2, freshness: "Fresh" },
      { ageDays: 2.05, eventType: "REPAYMENT", amount: 1396, sourceBlockOffset: 46, verificationOffset: 3, freshness: "Fresh" },
  ],
  expectations: {
    minEvidence: 3,
    freshness: "Fresh",
    requireFallback: false,
    allowOffer: true,
    requireAbstention: false,
    requirePolicyBlock: false,
  },
  tags: ["freshness", "case-002", "ethereum-sepolia"],
};

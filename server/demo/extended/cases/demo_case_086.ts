import type { ExtendedScenarioCase } from "../types";

export const demoCase086: ExtendedScenarioCase = {
  id: "extended-086",
  label: "Extended mock case 086 — fresh evidence",
  kind: "freshness",
  description: "Deterministic demo scenario for fresh evidence; no live-chain assertion is made.",
  walletSeed: "extended-wallet-086",
  transactionSeed: "extended-tx-086",
  chain: "Ethereum Sepolia",
  facts: [
      { ageDays: 0.05, eventType: "REPAYMENT", amount: 4282, sourceBlockOffset: 860, verificationOffset: 1, freshness: "Fresh" },
      { ageDays: 1.05, eventType: "COLLATERAL_DEPOSIT", amount: 4593, sourceBlockOffset: 873, verificationOffset: 2, freshness: "Fresh" },
      { ageDays: 2.05, eventType: "REPAYMENT", amount: 4904, sourceBlockOffset: 886, verificationOffset: 3, freshness: "Fresh" },
  ],
  expectations: {
    minEvidence: 3,
    freshness: "Fresh",
    requireFallback: false,
    allowOffer: true,
    requireAbstention: false,
    requirePolicyBlock: false,
  },
  tags: ["freshness", "case-086", "ethereum-sepolia"],
};

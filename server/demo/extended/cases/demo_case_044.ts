import type { ExtendedScenarioCase } from "../types";

export const demoCase044: ExtendedScenarioCase = {
  id: "extended-044",
  label: "Extended mock case 044 — fresh evidence",
  kind: "freshness",
  description: "Deterministic demo scenario for fresh evidence; no live-chain assertion is made.",
  walletSeed: "extended-wallet-044",
  transactionSeed: "extended-tx-044",
  chain: "Ethereum Sepolia",
  facts: [
      { ageDays: 0.05, eventType: "REPAYMENT", amount: 6528, sourceBlockOffset: 440, verificationOffset: 1, freshness: "Fresh" },
  ],
  expectations: {
    minEvidence: 1,
    freshness: "Fresh",
    requireFallback: false,
    allowOffer: true,
    requireAbstention: false,
    requirePolicyBlock: false,
  },
  tags: ["freshness", "case-044", "ethereum-sepolia"],
};

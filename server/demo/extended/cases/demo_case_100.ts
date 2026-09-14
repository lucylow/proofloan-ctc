import type { ExtendedScenarioCase } from "../types";

export const demoCase100: ExtendedScenarioCase = {
  id: "extended-100",
  label: "Extended mock case 100 — fresh evidence",
  kind: "freshness",
  description: "Deterministic demo scenario for fresh evidence; no live-chain assertion is made.",
  walletSeed: "extended-wallet-100",
  transactionSeed: "extended-tx-100",
  chain: "Ethereum Sepolia",
  facts: [
      { ageDays: 0.05, eventType: "REPAYMENT", amount: 6200, sourceBlockOffset: 1000, verificationOffset: 1, freshness: "Fresh" },
  ],
  expectations: {
    minEvidence: 1,
    freshness: "Fresh",
    requireFallback: false,
    allowOffer: true,
    requireAbstention: false,
    requirePolicyBlock: false,
  },
  tags: ["freshness", "case-100", "ethereum-sepolia"],
};

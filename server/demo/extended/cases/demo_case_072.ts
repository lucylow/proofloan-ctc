import type { ExtendedScenarioCase } from "../types";

export const demoCase072: ExtendedScenarioCase = {
  id: "extended-072",
  label: "Extended mock case 072 — fresh evidence",
  kind: "freshness",
  description: "Deterministic demo scenario for fresh evidence; no live-chain assertion is made.",
  walletSeed: "extended-wallet-072",
  transactionSeed: "extended-tx-072",
  chain: "Ethereum Sepolia",
  facts: [
      { ageDays: 0.05, eventType: "REPAYMENT", amount: 2364, sourceBlockOffset: 720, verificationOffset: 1, freshness: "Fresh" },
  ],
  expectations: {
    minEvidence: 1,
    freshness: "Fresh",
    requireFallback: false,
    allowOffer: true,
    requireAbstention: false,
    requirePolicyBlock: false,
  },
  tags: ["freshness", "case-072", "ethereum-sepolia"],
};

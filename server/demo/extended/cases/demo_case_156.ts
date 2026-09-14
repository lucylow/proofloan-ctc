import type { ExtendedScenarioCase } from "../types";

export const demoCase156: ExtendedScenarioCase = {
  id: "extended-156",
  label: "Extended mock case 156 — fresh evidence",
  kind: "freshness",
  description: "Deterministic demo scenario for fresh evidence; no live-chain assertion is made.",
  walletSeed: "extended-wallet-156",
  transactionSeed: "extended-tx-156",
  chain: "Ethereum Sepolia",
  facts: [
      { ageDays: 0.05, eventType: "REPAYMENT", amount: 5872, sourceBlockOffset: 1560, verificationOffset: 1, freshness: "Fresh" },
  ],
  expectations: {
    minEvidence: 1,
    freshness: "Fresh",
    requireFallback: false,
    allowOffer: true,
    requireAbstention: false,
    requirePolicyBlock: false,
  },
  tags: ["freshness", "case-156", "ethereum-sepolia"],
};

import type { ExtendedScenarioCase } from "../types";

export const demoCase016: ExtendedScenarioCase = {
  id: "extended-016",
  label: "Extended mock case 016 — fresh evidence",
  kind: "freshness",
  description: "Deterministic demo scenario for fresh evidence; no live-chain assertion is made.",
  walletSeed: "extended-wallet-016",
  transactionSeed: "extended-tx-016",
  chain: "Ethereum Sepolia",
  facts: [
      { ageDays: 0.05, eventType: "REPAYMENT", amount: 2692, sourceBlockOffset: 160, verificationOffset: 1, freshness: "Fresh" },
  ],
  expectations: {
    minEvidence: 1,
    freshness: "Fresh",
    requireFallback: false,
    allowOffer: true,
    requireAbstention: false,
    requirePolicyBlock: false,
  },
  tags: ["freshness", "case-016", "ethereum-sepolia"],
};

import type { ExtendedScenarioCase } from "../types";

export const demoCase030: ExtendedScenarioCase = {
  id: "extended-030",
  label: "Extended mock case 030 — fresh evidence",
  kind: "freshness",
  description: "Deterministic demo scenario for fresh evidence; no live-chain assertion is made.",
  walletSeed: "extended-wallet-030",
  transactionSeed: "extended-tx-030",
  chain: "Ethereum Sepolia",
  facts: [
      { ageDays: 0.05, eventType: "REPAYMENT", amount: 4610, sourceBlockOffset: 300, verificationOffset: 1, freshness: "Fresh" },
      { ageDays: 1.05, eventType: "COLLATERAL_DEPOSIT", amount: 4921, sourceBlockOffset: 313, verificationOffset: 2, freshness: "Fresh" },
      { ageDays: 2.05, eventType: "REPAYMENT", amount: 5232, sourceBlockOffset: 326, verificationOffset: 3, freshness: "Fresh" },
  ],
  expectations: {
    minEvidence: 3,
    freshness: "Fresh",
    requireFallback: false,
    allowOffer: true,
    requireAbstention: false,
    requirePolicyBlock: false,
  },
  tags: ["freshness", "case-030", "ethereum-sepolia"],
};

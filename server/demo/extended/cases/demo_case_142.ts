import type { ExtendedScenarioCase } from "../types";

export const demoCase142: ExtendedScenarioCase = {
  id: "extended-142",
  label: "Extended mock case 142 — fresh evidence",
  kind: "freshness",
  description: "Deterministic demo scenario for fresh evidence; no live-chain assertion is made.",
  walletSeed: "extended-wallet-142",
  transactionSeed: "extended-tx-142",
  chain: "Ethereum Sepolia",
  facts: [
      { ageDays: 0.05, eventType: "REPAYMENT", amount: 3954, sourceBlockOffset: 1420, verificationOffset: 1, freshness: "Fresh" },
      { ageDays: 1.05, eventType: "COLLATERAL_DEPOSIT", amount: 4265, sourceBlockOffset: 1433, verificationOffset: 2, freshness: "Fresh" },
      { ageDays: 2.05, eventType: "REPAYMENT", amount: 4576, sourceBlockOffset: 1446, verificationOffset: 3, freshness: "Fresh" },
  ],
  expectations: {
    minEvidence: 3,
    freshness: "Fresh",
    requireFallback: false,
    allowOffer: true,
    requireAbstention: false,
    requirePolicyBlock: false,
  },
  tags: ["freshness", "case-142", "ethereum-sepolia"],
};

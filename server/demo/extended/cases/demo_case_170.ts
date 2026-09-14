import type { ExtendedScenarioCase } from "../types";

export const demoCase170: ExtendedScenarioCase = {
  id: "extended-170",
  label: "Extended mock case 170 — fresh evidence",
  kind: "freshness",
  description: "Deterministic demo scenario for fresh evidence; no live-chain assertion is made.",
  walletSeed: "extended-wallet-170",
  transactionSeed: "extended-tx-170",
  chain: "Ethereum Sepolia",
  facts: [
      { ageDays: 0.05, eventType: "REPAYMENT", amount: 7790, sourceBlockOffset: 1700, verificationOffset: 1, freshness: "Fresh" },
      { ageDays: 1.05, eventType: "COLLATERAL_DEPOSIT", amount: 8101, sourceBlockOffset: 1713, verificationOffset: 2, freshness: "Fresh" },
      { ageDays: 2.05, eventType: "REPAYMENT", amount: 8412, sourceBlockOffset: 1726, verificationOffset: 3, freshness: "Fresh" },
  ],
  expectations: {
    minEvidence: 3,
    freshness: "Fresh",
    requireFallback: false,
    allowOffer: true,
    requireAbstention: false,
    requirePolicyBlock: false,
  },
  tags: ["freshness", "case-170", "ethereum-sepolia"],
};

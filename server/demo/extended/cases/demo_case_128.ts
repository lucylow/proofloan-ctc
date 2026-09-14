import type { ExtendedScenarioCase } from "../types";

export const demoCase128: ExtendedScenarioCase = {
  id: "extended-128",
  label: "Extended mock case 128 — fresh evidence",
  kind: "freshness",
  description: "Deterministic demo scenario for fresh evidence; no live-chain assertion is made.",
  walletSeed: "extended-wallet-128",
  transactionSeed: "extended-tx-128",
  chain: "Ethereum Sepolia",
  facts: [
      { ageDays: 0.05, eventType: "REPAYMENT", amount: 2036, sourceBlockOffset: 1280, verificationOffset: 1, freshness: "Fresh" },
  ],
  expectations: {
    minEvidence: 1,
    freshness: "Fresh",
    requireFallback: false,
    allowOffer: true,
    requireAbstention: false,
    requirePolicyBlock: false,
  },
  tags: ["freshness", "case-128", "ethereum-sepolia"],
};

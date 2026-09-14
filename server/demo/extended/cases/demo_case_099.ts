import type { ExtendedScenarioCase } from "../types";

export const demoCase099: ExtendedScenarioCase = {
  id: "extended-099",
  label: "Extended mock case 099 — stable repayment",
  kind: "happy-path",
  description: "Deterministic demo scenario for stable repayment; no live-chain assertion is made.",
  walletSeed: "extended-wallet-099",
  transactionSeed: "extended-tx-099",
  chain: "Ethereum Sepolia",
  facts: [
      { ageDays: 77, eventType: "REPAYMENT", amount: 6063, sourceBlockOffset: 990, verificationOffset: 1, freshness: "Aging" },
      { ageDays: 84, eventType: "COLLATERAL_DEPOSIT", amount: 6374, sourceBlockOffset: 1003, verificationOffset: 2, freshness: "Aging" },
      { ageDays: 91, eventType: "REPAYMENT", amount: 6685, sourceBlockOffset: 1016, verificationOffset: 3, freshness: "Stale" },
      { ageDays: 98, eventType: "REPAYMENT", amount: 6996, sourceBlockOffset: 1029, verificationOffset: 4, freshness: "Stale" },
  ],
  expectations: {
    minEvidence: 4,
    freshness: undefined,
    requireFallback: false,
    allowOffer: true,
    requireAbstention: false,
    requirePolicyBlock: false,
  },
  tags: ["happy-path", "case-099", "ethereum-sepolia"],
};

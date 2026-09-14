import type { ExtendedScenarioCase } from "../types";

export const demoCase103: ExtendedScenarioCase = {
  id: "extended-103",
  label: "Extended mock case 103 — cross-chain history",
  kind: "cross-chain",
  description: "Deterministic demo scenario for cross-chain history; no live-chain assertion is made.",
  walletSeed: "extended-wallet-103",
  transactionSeed: "extended-tx-103",
  chain: "Ethereum Sepolia",
  facts: [
      { ageDays: 89, eventType: "REPAYMENT", amount: 6611, sourceBlockOffset: 1030, verificationOffset: 1, freshness: "Aging" },
      { ageDays: 96, eventType: "COLLATERAL_DEPOSIT", amount: 6922, sourceBlockOffset: 1043, verificationOffset: 2, freshness: "Stale" },
      { ageDays: 103, eventType: "REPAYMENT", amount: 7233, sourceBlockOffset: 1056, verificationOffset: 3, freshness: "Stale" },
      { ageDays: 110, eventType: "REPAYMENT", amount: 7544, sourceBlockOffset: 1069, verificationOffset: 4, freshness: "Stale" },
  ],
  expectations: {
    minEvidence: 4,
    freshness: undefined,
    requireFallback: false,
    allowOffer: true,
    requireAbstention: false,
    requirePolicyBlock: false,
  },
  tags: ["cross-chain", "case-103", "ethereum-sepolia"],
};

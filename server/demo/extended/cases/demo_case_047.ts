import type { ExtendedScenarioCase } from "../types";

export const demoCase047: ExtendedScenarioCase = {
  id: "extended-047",
  label: "Extended mock case 047 — cross-chain history",
  kind: "cross-chain",
  description: "Deterministic demo scenario for cross-chain history; no live-chain assertion is made.",
  walletSeed: "extended-wallet-047",
  transactionSeed: "extended-tx-047",
  chain: "Ethereum Sepolia",
  facts: [
      { ageDays: 141, eventType: "REPAYMENT", amount: 6939, sourceBlockOffset: 470, verificationOffset: 1, freshness: "Stale" },
      { ageDays: 148, eventType: "COLLATERAL_DEPOSIT", amount: 7250, sourceBlockOffset: 483, verificationOffset: 2, freshness: "Stale" },
      { ageDays: 155, eventType: "REPAYMENT", amount: 7561, sourceBlockOffset: 496, verificationOffset: 3, freshness: "Stale" },
      { ageDays: 162, eventType: "REPAYMENT", amount: 7872, sourceBlockOffset: 509, verificationOffset: 4, freshness: "Stale" },
  ],
  expectations: {
    minEvidence: 4,
    freshness: undefined,
    requireFallback: false,
    allowOffer: true,
    requireAbstention: false,
    requirePolicyBlock: false,
  },
  tags: ["cross-chain", "case-047", "ethereum-sepolia"],
};

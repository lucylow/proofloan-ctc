import type { ExtendedScenarioCase } from "../types";

export const demoCase071: ExtendedScenarioCase = {
  id: "extended-071",
  label: "Extended mock case 071 — stable repayment",
  kind: "happy-path",
  description: "Deterministic demo scenario for stable repayment; no live-chain assertion is made.",
  walletSeed: "extended-wallet-071",
  transactionSeed: "extended-tx-071",
  chain: "Ethereum Sepolia",
  facts: [
      { ageDays: 213, eventType: "REPAYMENT", amount: 2227, sourceBlockOffset: 710, verificationOffset: 1, freshness: "Stale" },
      { ageDays: 0, eventType: "COLLATERAL_DEPOSIT", amount: 2538, sourceBlockOffset: 723, verificationOffset: 2, freshness: "Fresh" },
      { ageDays: 7, eventType: "REPAYMENT", amount: 2849, sourceBlockOffset: 736, verificationOffset: 3, freshness: "Fresh" },
      { ageDays: 14, eventType: "REPAYMENT", amount: 3160, sourceBlockOffset: 749, verificationOffset: 4, freshness: "Aging" },
  ],
  expectations: {
    minEvidence: 4,
    freshness: undefined,
    requireFallback: false,
    allowOffer: true,
    requireAbstention: false,
    requirePolicyBlock: false,
  },
  tags: ["happy-path", "case-071", "ethereum-sepolia"],
};

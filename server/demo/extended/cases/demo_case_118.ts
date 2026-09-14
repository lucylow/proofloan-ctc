import type { ExtendedScenarioCase } from "../types";

export const demoCase118: ExtendedScenarioCase = {
  id: "extended-118",
  label: "Extended mock case 118 — attestor unavailable",
  kind: "attestor-failure",
  description: "Deterministic demo scenario for attestor unavailable; no live-chain assertion is made.",
  walletSeed: "extended-wallet-118",
  transactionSeed: "extended-tx-118",
  chain: "Ethereum Sepolia",
  facts: [
      { ageDays: 134, eventType: "REPAYMENT", amount: 666, sourceBlockOffset: 1180, verificationOffset: 1, freshness: "Stale" },
      { ageDays: 141, eventType: "COLLATERAL_DEPOSIT", amount: 977, sourceBlockOffset: 1193, verificationOffset: 2, freshness: "Stale" },
      { ageDays: 148, eventType: "REPAYMENT", amount: 1288, sourceBlockOffset: 1206, verificationOffset: 3, freshness: "Stale" },
  ],
    failure: { kind: "attestor", message: "Synthetic Attestor outage", retryAfterMs: 5000 },
  expectations: {
    minEvidence: 3,
    freshness: undefined,
    requireFallback: true,
    allowOffer: true,
    requireAbstention: false,
    requirePolicyBlock: false,
  },
  tags: ["attestor-failure", "case-118", "ethereum-sepolia"],
};

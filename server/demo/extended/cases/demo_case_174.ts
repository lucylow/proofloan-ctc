import type { ExtendedScenarioCase } from "../types";

export const demoCase174: ExtendedScenarioCase = {
  id: "extended-174",
  label: "Extended mock case 174 — attestor unavailable",
  kind: "attestor-failure",
  description: "Deterministic demo scenario for attestor unavailable; no live-chain assertion is made.",
  walletSeed: "extended-wallet-174",
  transactionSeed: "extended-tx-174",
  chain: "Ethereum Sepolia",
  facts: [
      { ageDays: 82, eventType: "REPAYMENT", amount: 8338, sourceBlockOffset: 1740, verificationOffset: 1, freshness: "Aging" },
      { ageDays: 89, eventType: "COLLATERAL_DEPOSIT", amount: 649, sourceBlockOffset: 1753, verificationOffset: 2, freshness: "Aging" },
      { ageDays: 96, eventType: "REPAYMENT", amount: 960, sourceBlockOffset: 1766, verificationOffset: 3, freshness: "Stale" },
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
  tags: ["attestor-failure", "case-174", "ethereum-sepolia"],
};

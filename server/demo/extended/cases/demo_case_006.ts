import type { ExtendedScenarioCase } from "../types";

export const demoCase006: ExtendedScenarioCase = {
  id: "extended-006",
  label: "Extended mock case 006 — attestor unavailable",
  kind: "attestor-failure",
  description: "Deterministic demo scenario for attestor unavailable; no live-chain assertion is made.",
  walletSeed: "extended-wallet-006",
  transactionSeed: "extended-tx-006",
  chain: "Ethereum Sepolia",
  facts: [
      { ageDays: 18, eventType: "REPAYMENT", amount: 1322, sourceBlockOffset: 60, verificationOffset: 1, freshness: "Aging" },
      { ageDays: 25, eventType: "COLLATERAL_DEPOSIT", amount: 1633, sourceBlockOffset: 73, verificationOffset: 2, freshness: "Aging" },
      { ageDays: 32, eventType: "REPAYMENT", amount: 1944, sourceBlockOffset: 86, verificationOffset: 3, freshness: "Aging" },
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
  tags: ["attestor-failure", "case-006", "ethereum-sepolia"],
};

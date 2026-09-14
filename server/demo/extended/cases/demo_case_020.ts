import type { ExtendedScenarioCase } from "../types";

export const demoCase020: ExtendedScenarioCase = {
  id: "extended-020",
  label: "Extended mock case 020 — attestor unavailable",
  kind: "attestor-failure",
  description: "Deterministic demo scenario for attestor unavailable; no live-chain assertion is made.",
  walletSeed: "extended-wallet-020",
  transactionSeed: "extended-tx-020",
  chain: "Ethereum Sepolia",
  facts: [
      { ageDays: 60, eventType: "REPAYMENT", amount: 3240, sourceBlockOffset: 200, verificationOffset: 1, freshness: "Aging" },
  ],
    failure: { kind: "attestor", message: "Synthetic Attestor outage", retryAfterMs: 5000 },
  expectations: {
    minEvidence: 1,
    freshness: undefined,
    requireFallback: true,
    allowOffer: true,
    requireAbstention: false,
    requirePolicyBlock: false,
  },
  tags: ["attestor-failure", "case-020", "ethereum-sepolia"],
};

import type { ExtendedScenarioCase } from "../types";

export const demoCase132: ExtendedScenarioCase = {
  id: "extended-132",
  label: "Extended mock case 132 — attestor unavailable",
  kind: "attestor-failure",
  description: "Deterministic demo scenario for attestor unavailable; no live-chain assertion is made.",
  walletSeed: "extended-wallet-132",
  transactionSeed: "extended-tx-132",
  chain: "Ethereum Sepolia",
  facts: [
      { ageDays: 176, eventType: "REPAYMENT", amount: 2584, sourceBlockOffset: 1320, verificationOffset: 1, freshness: "Stale" },
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
  tags: ["attestor-failure", "case-132", "ethereum-sepolia"],
};

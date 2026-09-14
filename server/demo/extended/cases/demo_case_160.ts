import type { ExtendedScenarioCase } from "../types";

export const demoCase160: ExtendedScenarioCase = {
  id: "extended-160",
  label: "Extended mock case 160 — attestor unavailable",
  kind: "attestor-failure",
  description: "Deterministic demo scenario for attestor unavailable; no live-chain assertion is made.",
  walletSeed: "extended-wallet-160",
  transactionSeed: "extended-tx-160",
  chain: "Ethereum Sepolia",
  facts: [
      { ageDays: 40, eventType: "REPAYMENT", amount: 6420, sourceBlockOffset: 1600, verificationOffset: 1, freshness: "Aging" },
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
  tags: ["attestor-failure", "case-160", "ethereum-sepolia"],
};

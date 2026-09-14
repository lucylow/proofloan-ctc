import type { ExtendedScenarioCase } from "../types";

export const demoCase048: ExtendedScenarioCase = {
  id: "extended-048",
  label: "Extended mock case 048 — attestor unavailable",
  kind: "attestor-failure",
  description: "Deterministic demo scenario for attestor unavailable; no live-chain assertion is made.",
  walletSeed: "extended-wallet-048",
  transactionSeed: "extended-tx-048",
  chain: "Ethereum Sepolia",
  facts: [
      { ageDays: 144, eventType: "REPAYMENT", amount: 7076, sourceBlockOffset: 480, verificationOffset: 1, freshness: "Stale" },
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
  tags: ["attestor-failure", "case-048", "ethereum-sepolia"],
};

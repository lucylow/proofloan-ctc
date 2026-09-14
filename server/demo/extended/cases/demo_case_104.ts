import type { ExtendedScenarioCase } from "../types";

export const demoCase104: ExtendedScenarioCase = {
  id: "extended-104",
  label: "Extended mock case 104 — attestor unavailable",
  kind: "attestor-failure",
  description: "Deterministic demo scenario for attestor unavailable; no live-chain assertion is made.",
  walletSeed: "extended-wallet-104",
  transactionSeed: "extended-tx-104",
  chain: "Ethereum Sepolia",
  facts: [
      { ageDays: 92, eventType: "REPAYMENT", amount: 6748, sourceBlockOffset: 1040, verificationOffset: 1, freshness: "Stale" },
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
  tags: ["attestor-failure", "case-104", "ethereum-sepolia"],
};

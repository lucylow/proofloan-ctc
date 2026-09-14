import type { ExtendedScenarioCase } from "../types";

export const demoCase076: ExtendedScenarioCase = {
  id: "extended-076",
  label: "Extended mock case 076 — attestor unavailable",
  kind: "attestor-failure",
  description: "Deterministic demo scenario for attestor unavailable; no live-chain assertion is made.",
  walletSeed: "extended-wallet-076",
  transactionSeed: "extended-tx-076",
  chain: "Ethereum Sepolia",
  facts: [
      { ageDays: 8, eventType: "REPAYMENT", amount: 2912, sourceBlockOffset: 760, verificationOffset: 1, freshness: "Aging" },
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
  tags: ["attestor-failure", "case-076", "ethereum-sepolia"],
};

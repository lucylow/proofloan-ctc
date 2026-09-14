import type { ExtendedScenarioCase } from "../types";

export const demoCase090: ExtendedScenarioCase = {
  id: "extended-090",
  label: "Extended mock case 090 — attestor unavailable",
  kind: "attestor-failure",
  description: "Deterministic demo scenario for attestor unavailable; no live-chain assertion is made.",
  walletSeed: "extended-wallet-090",
  transactionSeed: "extended-tx-090",
  chain: "Ethereum Sepolia",
  facts: [
      { ageDays: 50, eventType: "REPAYMENT", amount: 4830, sourceBlockOffset: 900, verificationOffset: 1, freshness: "Aging" },
      { ageDays: 57, eventType: "COLLATERAL_DEPOSIT", amount: 5141, sourceBlockOffset: 913, verificationOffset: 2, freshness: "Aging" },
      { ageDays: 64, eventType: "REPAYMENT", amount: 5452, sourceBlockOffset: 926, verificationOffset: 3, freshness: "Aging" },
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
  tags: ["attestor-failure", "case-090", "ethereum-sepolia"],
};

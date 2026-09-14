import type { ExtendedScenarioCase } from "../types";

export const demoCase146: ExtendedScenarioCase = {
  id: "extended-146",
  label: "Extended mock case 146 — attestor unavailable",
  kind: "attestor-failure",
  description: "Deterministic demo scenario for attestor unavailable; no live-chain assertion is made.",
  walletSeed: "extended-wallet-146",
  transactionSeed: "extended-tx-146",
  chain: "Ethereum Sepolia",
  facts: [
      { ageDays: 218, eventType: "REPAYMENT", amount: 4502, sourceBlockOffset: 1460, verificationOffset: 1, freshness: "Stale" },
      { ageDays: 5, eventType: "COLLATERAL_DEPOSIT", amount: 4813, sourceBlockOffset: 1473, verificationOffset: 2, freshness: "Fresh" },
      { ageDays: 12, eventType: "REPAYMENT", amount: 5124, sourceBlockOffset: 1486, verificationOffset: 3, freshness: "Aging" },
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
  tags: ["attestor-failure", "case-146", "ethereum-sepolia"],
};

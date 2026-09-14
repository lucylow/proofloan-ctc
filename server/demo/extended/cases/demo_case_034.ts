import type { ExtendedScenarioCase } from "../types";

export const demoCase034: ExtendedScenarioCase = {
  id: "extended-034",
  label: "Extended mock case 034 — attestor unavailable",
  kind: "attestor-failure",
  description: "Deterministic demo scenario for attestor unavailable; no live-chain assertion is made.",
  walletSeed: "extended-wallet-034",
  transactionSeed: "extended-tx-034",
  chain: "Ethereum Sepolia",
  facts: [
      { ageDays: 102, eventType: "REPAYMENT", amount: 5158, sourceBlockOffset: 340, verificationOffset: 1, freshness: "Stale" },
      { ageDays: 109, eventType: "COLLATERAL_DEPOSIT", amount: 5469, sourceBlockOffset: 353, verificationOffset: 2, freshness: "Stale" },
      { ageDays: 116, eventType: "REPAYMENT", amount: 5780, sourceBlockOffset: 366, verificationOffset: 3, freshness: "Stale" },
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
  tags: ["attestor-failure", "case-034", "ethereum-sepolia"],
};

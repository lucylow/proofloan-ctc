import type { ExtendedScenarioCase } from "../types";

export const demoCase062: ExtendedScenarioCase = {
  id: "extended-062",
  label: "Extended mock case 062 — attestor unavailable",
  kind: "attestor-failure",
  description: "Deterministic demo scenario for attestor unavailable; no live-chain assertion is made.",
  walletSeed: "extended-wallet-062",
  transactionSeed: "extended-tx-062",
  chain: "Ethereum Sepolia",
  facts: [
      { ageDays: 186, eventType: "REPAYMENT", amount: 994, sourceBlockOffset: 620, verificationOffset: 1, freshness: "Stale" },
      { ageDays: 193, eventType: "COLLATERAL_DEPOSIT", amount: 1305, sourceBlockOffset: 633, verificationOffset: 2, freshness: "Stale" },
      { ageDays: 200, eventType: "REPAYMENT", amount: 1616, sourceBlockOffset: 646, verificationOffset: 3, freshness: "Stale" },
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
  tags: ["attestor-failure", "case-062", "ethereum-sepolia"],
};

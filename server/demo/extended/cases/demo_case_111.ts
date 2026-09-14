import type { ExtendedScenarioCase } from "../types";

export const demoCase111: ExtendedScenarioCase = {
  id: "extended-111",
  label: "Extended mock case 111 — operator recovery",
  kind: "operator-recovery",
  description: "Deterministic demo scenario for operator recovery; no live-chain assertion is made.",
  walletSeed: "extended-wallet-111",
  transactionSeed: "extended-tx-111",
  chain: "Ethereum Mainnet",
  facts: [
      { ageDays: 113, eventType: "REPAYMENT", amount: 7707, sourceBlockOffset: 1110, verificationOffset: 1, freshness: "Stale" },
      { ageDays: 120, eventType: "COLLATERAL_DEPOSIT", amount: 8018, sourceBlockOffset: 1123, verificationOffset: 2, freshness: "Stale" },
      { ageDays: 127, eventType: "REPAYMENT", amount: 8329, sourceBlockOffset: 1136, verificationOffset: 3, freshness: "Stale" },
      { ageDays: 134, eventType: "REPAYMENT", amount: 640, sourceBlockOffset: 1149, verificationOffset: 4, freshness: "Stale" },
  ],
    failure: { kind: "attestor", message: "Operator recovering after restart", retryAfterMs: 2000 },
  expectations: {
    minEvidence: 4,
    freshness: undefined,
    requireFallback: true,
    allowOffer: true,
    requireAbstention: false,
    requirePolicyBlock: false,
  },
  tags: ["operator-recovery", "case-111", "ethereum-mainnet"],
};

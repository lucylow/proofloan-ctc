import type { ExtendedScenarioCase } from "../types";

export const demoCase055: ExtendedScenarioCase = {
  id: "extended-055",
  label: "Extended mock case 055 — operator recovery",
  kind: "operator-recovery",
  description: "Deterministic demo scenario for operator recovery; no live-chain assertion is made.",
  walletSeed: "extended-wallet-055",
  transactionSeed: "extended-tx-055",
  chain: "Ethereum Mainnet",
  facts: [
      { ageDays: 165, eventType: "REPAYMENT", amount: 8035, sourceBlockOffset: 550, verificationOffset: 1, freshness: "Stale" },
      { ageDays: 172, eventType: "COLLATERAL_DEPOSIT", amount: 8346, sourceBlockOffset: 563, verificationOffset: 2, freshness: "Stale" },
      { ageDays: 179, eventType: "REPAYMENT", amount: 657, sourceBlockOffset: 576, verificationOffset: 3, freshness: "Stale" },
      { ageDays: 186, eventType: "REPAYMENT", amount: 968, sourceBlockOffset: 589, verificationOffset: 4, freshness: "Stale" },
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
  tags: ["operator-recovery", "case-055", "ethereum-mainnet"],
};

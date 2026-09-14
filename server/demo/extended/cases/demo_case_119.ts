import type { ExtendedScenarioCase } from "../types";

export const demoCase119: ExtendedScenarioCase = {
  id: "extended-119",
  label: "Extended mock case 119 — rpc outage",
  kind: "rpc-failure",
  description: "Deterministic demo scenario for rpc outage; no live-chain assertion is made.",
  walletSeed: "extended-wallet-119",
  transactionSeed: "extended-tx-119",
  chain: "Ethereum Mainnet",
  facts: [
      { ageDays: 137, eventType: "REPAYMENT", amount: 803, sourceBlockOffset: 1190, verificationOffset: 1, freshness: "Stale" },
      { ageDays: 144, eventType: "COLLATERAL_DEPOSIT", amount: 1114, sourceBlockOffset: 1203, verificationOffset: 2, freshness: "Stale" },
      { ageDays: 151, eventType: "REPAYMENT", amount: 1425, sourceBlockOffset: 1216, verificationOffset: 3, freshness: "Stale" },
      { ageDays: 158, eventType: "REPAYMENT", amount: 1736, sourceBlockOffset: 1229, verificationOffset: 4, freshness: "Stale" },
  ],
    failure: { kind: "rpc", message: "Synthetic RPC timeout", retryAfterMs: 3000 },
  expectations: {
    minEvidence: 4,
    freshness: undefined,
    requireFallback: true,
    allowOffer: true,
    requireAbstention: false,
    requirePolicyBlock: false,
  },
  tags: ["rpc-failure", "case-119", "ethereum-mainnet"],
};

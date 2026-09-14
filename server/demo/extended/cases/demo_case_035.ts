import type { ExtendedScenarioCase } from "../types";

export const demoCase035: ExtendedScenarioCase = {
  id: "extended-035",
  label: "Extended mock case 035 — rpc outage",
  kind: "rpc-failure",
  description: "Deterministic demo scenario for rpc outage; no live-chain assertion is made.",
  walletSeed: "extended-wallet-035",
  transactionSeed: "extended-tx-035",
  chain: "Ethereum Mainnet",
  facts: [
      { ageDays: 105, eventType: "REPAYMENT", amount: 5295, sourceBlockOffset: 350, verificationOffset: 1, freshness: "Stale" },
      { ageDays: 112, eventType: "COLLATERAL_DEPOSIT", amount: 5606, sourceBlockOffset: 363, verificationOffset: 2, freshness: "Stale" },
      { ageDays: 119, eventType: "REPAYMENT", amount: 5917, sourceBlockOffset: 376, verificationOffset: 3, freshness: "Stale" },
      { ageDays: 126, eventType: "REPAYMENT", amount: 6228, sourceBlockOffset: 389, verificationOffset: 4, freshness: "Stale" },
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
  tags: ["rpc-failure", "case-035", "ethereum-mainnet"],
};

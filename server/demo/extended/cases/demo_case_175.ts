import type { ExtendedScenarioCase } from "../types";

export const demoCase175: ExtendedScenarioCase = {
  id: "extended-175",
  label: "Extended mock case 175 — rpc outage",
  kind: "rpc-failure",
  description: "Deterministic demo scenario for rpc outage; no live-chain assertion is made.",
  walletSeed: "extended-wallet-175",
  transactionSeed: "extended-tx-175",
  chain: "Ethereum Mainnet",
  facts: [
      { ageDays: 85, eventType: "REPAYMENT", amount: 8475, sourceBlockOffset: 1750, verificationOffset: 1, freshness: "Aging" },
      { ageDays: 92, eventType: "COLLATERAL_DEPOSIT", amount: 786, sourceBlockOffset: 1763, verificationOffset: 2, freshness: "Stale" },
      { ageDays: 99, eventType: "REPAYMENT", amount: 1097, sourceBlockOffset: 1776, verificationOffset: 3, freshness: "Stale" },
      { ageDays: 106, eventType: "REPAYMENT", amount: 1408, sourceBlockOffset: 1789, verificationOffset: 4, freshness: "Stale" },
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
  tags: ["rpc-failure", "case-175", "ethereum-mainnet"],
};

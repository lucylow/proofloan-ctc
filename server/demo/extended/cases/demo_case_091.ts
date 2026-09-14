import type { ExtendedScenarioCase } from "../types";

export const demoCase091: ExtendedScenarioCase = {
  id: "extended-091",
  label: "Extended mock case 091 — rpc outage",
  kind: "rpc-failure",
  description: "Deterministic demo scenario for rpc outage; no live-chain assertion is made.",
  walletSeed: "extended-wallet-091",
  transactionSeed: "extended-tx-091",
  chain: "Ethereum Mainnet",
  facts: [
      { ageDays: 53, eventType: "REPAYMENT", amount: 4967, sourceBlockOffset: 910, verificationOffset: 1, freshness: "Aging" },
      { ageDays: 60, eventType: "COLLATERAL_DEPOSIT", amount: 5278, sourceBlockOffset: 923, verificationOffset: 2, freshness: "Aging" },
      { ageDays: 67, eventType: "REPAYMENT", amount: 5589, sourceBlockOffset: 936, verificationOffset: 3, freshness: "Aging" },
      { ageDays: 74, eventType: "REPAYMENT", amount: 5900, sourceBlockOffset: 949, verificationOffset: 4, freshness: "Aging" },
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
  tags: ["rpc-failure", "case-091", "ethereum-mainnet"],
};

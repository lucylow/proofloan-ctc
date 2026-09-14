import type { ExtendedScenarioCase } from "../types";

export const demoCase147: ExtendedScenarioCase = {
  id: "extended-147",
  label: "Extended mock case 147 — rpc outage",
  kind: "rpc-failure",
  description: "Deterministic demo scenario for rpc outage; no live-chain assertion is made.",
  walletSeed: "extended-wallet-147",
  transactionSeed: "extended-tx-147",
  chain: "Ethereum Mainnet",
  facts: [
      { ageDays: 1, eventType: "REPAYMENT", amount: 4639, sourceBlockOffset: 1470, verificationOffset: 1, freshness: "Fresh" },
      { ageDays: 8, eventType: "COLLATERAL_DEPOSIT", amount: 4950, sourceBlockOffset: 1483, verificationOffset: 2, freshness: "Aging" },
      { ageDays: 15, eventType: "REPAYMENT", amount: 5261, sourceBlockOffset: 1496, verificationOffset: 3, freshness: "Aging" },
      { ageDays: 22, eventType: "REPAYMENT", amount: 5572, sourceBlockOffset: 1509, verificationOffset: 4, freshness: "Aging" },
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
  tags: ["rpc-failure", "case-147", "ethereum-mainnet"],
};

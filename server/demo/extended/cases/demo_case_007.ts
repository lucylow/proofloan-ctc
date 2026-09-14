import type { ExtendedScenarioCase } from "../types";

export const demoCase007: ExtendedScenarioCase = {
  id: "extended-007",
  label: "Extended mock case 007 — rpc outage",
  kind: "rpc-failure",
  description: "Deterministic demo scenario for rpc outage; no live-chain assertion is made.",
  walletSeed: "extended-wallet-007",
  transactionSeed: "extended-tx-007",
  chain: "Ethereum Mainnet",
  facts: [
      { ageDays: 21, eventType: "REPAYMENT", amount: 1459, sourceBlockOffset: 70, verificationOffset: 1, freshness: "Aging" },
      { ageDays: 28, eventType: "COLLATERAL_DEPOSIT", amount: 1770, sourceBlockOffset: 83, verificationOffset: 2, freshness: "Aging" },
      { ageDays: 35, eventType: "REPAYMENT", amount: 2081, sourceBlockOffset: 96, verificationOffset: 3, freshness: "Aging" },
      { ageDays: 42, eventType: "REPAYMENT", amount: 2392, sourceBlockOffset: 109, verificationOffset: 4, freshness: "Aging" },
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
  tags: ["rpc-failure", "case-007", "ethereum-mainnet"],
};

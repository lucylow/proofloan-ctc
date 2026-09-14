import type { ExtendedScenarioCase } from "../types";

export const demoCase161: ExtendedScenarioCase = {
  id: "extended-161",
  label: "Extended mock case 161 — rpc outage",
  kind: "rpc-failure",
  description: "Deterministic demo scenario for rpc outage; no live-chain assertion is made.",
  walletSeed: "extended-wallet-161",
  transactionSeed: "extended-tx-161",
  chain: "Ethereum Mainnet",
  facts: [
      { ageDays: 43, eventType: "REPAYMENT", amount: 6557, sourceBlockOffset: 1610, verificationOffset: 1, freshness: "Aging" },
      { ageDays: 50, eventType: "COLLATERAL_DEPOSIT", amount: 6868, sourceBlockOffset: 1623, verificationOffset: 2, freshness: "Aging" },
  ],
    failure: { kind: "rpc", message: "Synthetic RPC timeout", retryAfterMs: 3000 },
  expectations: {
    minEvidence: 2,
    freshness: undefined,
    requireFallback: true,
    allowOffer: true,
    requireAbstention: false,
    requirePolicyBlock: false,
  },
  tags: ["rpc-failure", "case-161", "ethereum-mainnet"],
};

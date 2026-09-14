import type { ExtendedScenarioCase } from "../types";

export const demoCase021: ExtendedScenarioCase = {
  id: "extended-021",
  label: "Extended mock case 021 — rpc outage",
  kind: "rpc-failure",
  description: "Deterministic demo scenario for rpc outage; no live-chain assertion is made.",
  walletSeed: "extended-wallet-021",
  transactionSeed: "extended-tx-021",
  chain: "Ethereum Mainnet",
  facts: [
      { ageDays: 63, eventType: "REPAYMENT", amount: 3377, sourceBlockOffset: 210, verificationOffset: 1, freshness: "Aging" },
      { ageDays: 70, eventType: "COLLATERAL_DEPOSIT", amount: 3688, sourceBlockOffset: 223, verificationOffset: 2, freshness: "Aging" },
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
  tags: ["rpc-failure", "case-021", "ethereum-mainnet"],
};

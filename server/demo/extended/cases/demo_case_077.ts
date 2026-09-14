import type { ExtendedScenarioCase } from "../types";

export const demoCase077: ExtendedScenarioCase = {
  id: "extended-077",
  label: "Extended mock case 077 — rpc outage",
  kind: "rpc-failure",
  description: "Deterministic demo scenario for rpc outage; no live-chain assertion is made.",
  walletSeed: "extended-wallet-077",
  transactionSeed: "extended-tx-077",
  chain: "Ethereum Mainnet",
  facts: [
      { ageDays: 11, eventType: "REPAYMENT", amount: 3049, sourceBlockOffset: 770, verificationOffset: 1, freshness: "Aging" },
      { ageDays: 18, eventType: "COLLATERAL_DEPOSIT", amount: 3360, sourceBlockOffset: 783, verificationOffset: 2, freshness: "Aging" },
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
  tags: ["rpc-failure", "case-077", "ethereum-mainnet"],
};

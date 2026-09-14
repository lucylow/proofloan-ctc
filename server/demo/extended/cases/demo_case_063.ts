import type { ExtendedScenarioCase } from "../types";

export const demoCase063: ExtendedScenarioCase = {
  id: "extended-063",
  label: "Extended mock case 063 — rpc outage",
  kind: "rpc-failure",
  description: "Deterministic demo scenario for rpc outage; no live-chain assertion is made.",
  walletSeed: "extended-wallet-063",
  transactionSeed: "extended-tx-063",
  chain: "Ethereum Mainnet",
  facts: [
      { ageDays: 189, eventType: "REPAYMENT", amount: 1131, sourceBlockOffset: 630, verificationOffset: 1, freshness: "Stale" },
      { ageDays: 196, eventType: "COLLATERAL_DEPOSIT", amount: 1442, sourceBlockOffset: 643, verificationOffset: 2, freshness: "Stale" },
      { ageDays: 203, eventType: "REPAYMENT", amount: 1753, sourceBlockOffset: 656, verificationOffset: 3, freshness: "Stale" },
      { ageDays: 210, eventType: "REPAYMENT", amount: 2064, sourceBlockOffset: 669, verificationOffset: 4, freshness: "Stale" },
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
  tags: ["rpc-failure", "case-063", "ethereum-mainnet"],
};

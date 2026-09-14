import type { ExtendedScenarioCase } from "../types";

export const demoCase105: ExtendedScenarioCase = {
  id: "extended-105",
  label: "Extended mock case 105 — rpc outage",
  kind: "rpc-failure",
  description: "Deterministic demo scenario for rpc outage; no live-chain assertion is made.",
  walletSeed: "extended-wallet-105",
  transactionSeed: "extended-tx-105",
  chain: "Ethereum Mainnet",
  facts: [
      { ageDays: 95, eventType: "REPAYMENT", amount: 6885, sourceBlockOffset: 1050, verificationOffset: 1, freshness: "Stale" },
      { ageDays: 102, eventType: "COLLATERAL_DEPOSIT", amount: 7196, sourceBlockOffset: 1063, verificationOffset: 2, freshness: "Stale" },
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
  tags: ["rpc-failure", "case-105", "ethereum-mainnet"],
};

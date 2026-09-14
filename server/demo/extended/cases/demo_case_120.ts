import type { ExtendedScenarioCase } from "../types";

export const demoCase120: ExtendedScenarioCase = {
  id: "extended-120",
  label: "Extended mock case 120 — proof builder outage",
  kind: "proof-builder-failure",
  description: "Deterministic demo scenario for proof builder outage; no live-chain assertion is made.",
  walletSeed: "extended-wallet-120",
  transactionSeed: "extended-tx-120",
  chain: "Ethereum Mainnet",
  facts: [
      { ageDays: 140, eventType: "REPAYMENT", amount: 940, sourceBlockOffset: 1200, verificationOffset: 1, freshness: "Stale" },
  ],
    failure: { kind: "proof-builder", message: "Synthetic Proof Builder outage", retryAfterMs: 7000 },
  expectations: {
    minEvidence: 1,
    freshness: undefined,
    requireFallback: true,
    allowOffer: true,
    requireAbstention: false,
    requirePolicyBlock: false,
  },
  tags: ["proof-builder-failure", "case-120", "ethereum-mainnet"],
};

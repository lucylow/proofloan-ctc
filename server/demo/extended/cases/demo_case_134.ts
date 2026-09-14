import type { ExtendedScenarioCase } from "../types";

export const demoCase134: ExtendedScenarioCase = {
  id: "extended-134",
  label: "Extended mock case 134 — proof builder outage",
  kind: "proof-builder-failure",
  description: "Deterministic demo scenario for proof builder outage; no live-chain assertion is made.",
  walletSeed: "extended-wallet-134",
  transactionSeed: "extended-tx-134",
  chain: "Ethereum Mainnet",
  facts: [
      { ageDays: 182, eventType: "REPAYMENT", amount: 2858, sourceBlockOffset: 1340, verificationOffset: 1, freshness: "Stale" },
      { ageDays: 189, eventType: "COLLATERAL_DEPOSIT", amount: 3169, sourceBlockOffset: 1353, verificationOffset: 2, freshness: "Stale" },
      { ageDays: 196, eventType: "REPAYMENT", amount: 3480, sourceBlockOffset: 1366, verificationOffset: 3, freshness: "Stale" },
  ],
    failure: { kind: "proof-builder", message: "Synthetic Proof Builder outage", retryAfterMs: 7000 },
  expectations: {
    minEvidence: 3,
    freshness: undefined,
    requireFallback: true,
    allowOffer: true,
    requireAbstention: false,
    requirePolicyBlock: false,
  },
  tags: ["proof-builder-failure", "case-134", "ethereum-mainnet"],
};

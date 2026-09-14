import type { ExtendedScenarioCase } from "../types";

export const demoCase064: ExtendedScenarioCase = {
  id: "extended-064",
  label: "Extended mock case 064 — proof builder outage",
  kind: "proof-builder-failure",
  description: "Deterministic demo scenario for proof builder outage; no live-chain assertion is made.",
  walletSeed: "extended-wallet-064",
  transactionSeed: "extended-tx-064",
  chain: "Ethereum Mainnet",
  facts: [
      { ageDays: 192, eventType: "REPAYMENT", amount: 1268, sourceBlockOffset: 640, verificationOffset: 1, freshness: "Stale" },
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
  tags: ["proof-builder-failure", "case-064", "ethereum-mainnet"],
};

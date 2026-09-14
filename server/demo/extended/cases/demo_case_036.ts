import type { ExtendedScenarioCase } from "../types";

export const demoCase036: ExtendedScenarioCase = {
  id: "extended-036",
  label: "Extended mock case 036 — proof builder outage",
  kind: "proof-builder-failure",
  description: "Deterministic demo scenario for proof builder outage; no live-chain assertion is made.",
  walletSeed: "extended-wallet-036",
  transactionSeed: "extended-tx-036",
  chain: "Ethereum Mainnet",
  facts: [
      { ageDays: 108, eventType: "REPAYMENT", amount: 5432, sourceBlockOffset: 360, verificationOffset: 1, freshness: "Stale" },
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
  tags: ["proof-builder-failure", "case-036", "ethereum-mainnet"],
};

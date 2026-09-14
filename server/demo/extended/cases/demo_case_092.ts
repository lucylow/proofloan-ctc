import type { ExtendedScenarioCase } from "../types";

export const demoCase092: ExtendedScenarioCase = {
  id: "extended-092",
  label: "Extended mock case 092 — proof builder outage",
  kind: "proof-builder-failure",
  description: "Deterministic demo scenario for proof builder outage; no live-chain assertion is made.",
  walletSeed: "extended-wallet-092",
  transactionSeed: "extended-tx-092",
  chain: "Ethereum Mainnet",
  facts: [
      { ageDays: 56, eventType: "REPAYMENT", amount: 5104, sourceBlockOffset: 920, verificationOffset: 1, freshness: "Aging" },
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
  tags: ["proof-builder-failure", "case-092", "ethereum-mainnet"],
};

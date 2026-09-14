import type { ExtendedScenarioCase } from "../types";

export const demoCase008: ExtendedScenarioCase = {
  id: "extended-008",
  label: "Extended mock case 008 — proof builder outage",
  kind: "proof-builder-failure",
  description: "Deterministic demo scenario for proof builder outage; no live-chain assertion is made.",
  walletSeed: "extended-wallet-008",
  transactionSeed: "extended-tx-008",
  chain: "Ethereum Mainnet",
  facts: [
      { ageDays: 24, eventType: "REPAYMENT", amount: 1596, sourceBlockOffset: 80, verificationOffset: 1, freshness: "Aging" },
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
  tags: ["proof-builder-failure", "case-008", "ethereum-mainnet"],
};

import type { ExtendedScenarioCase } from "../types";

export const demoCase176: ExtendedScenarioCase = {
  id: "extended-176",
  label: "Extended mock case 176 — proof builder outage",
  kind: "proof-builder-failure",
  description: "Deterministic demo scenario for proof builder outage; no live-chain assertion is made.",
  walletSeed: "extended-wallet-176",
  transactionSeed: "extended-tx-176",
  chain: "Ethereum Mainnet",
  facts: [
      { ageDays: 88, eventType: "REPAYMENT", amount: 612, sourceBlockOffset: 1760, verificationOffset: 1, freshness: "Aging" },
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
  tags: ["proof-builder-failure", "case-176", "ethereum-mainnet"],
};

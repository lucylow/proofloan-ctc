import type { ExtendedScenarioCase } from "../types";

export const demoCase148: ExtendedScenarioCase = {
  id: "extended-148",
  label: "Extended mock case 148 — proof builder outage",
  kind: "proof-builder-failure",
  description: "Deterministic demo scenario for proof builder outage; no live-chain assertion is made.",
  walletSeed: "extended-wallet-148",
  transactionSeed: "extended-tx-148",
  chain: "Ethereum Mainnet",
  facts: [
      { ageDays: 4, eventType: "REPAYMENT", amount: 4776, sourceBlockOffset: 1480, verificationOffset: 1, freshness: "Fresh" },
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
  tags: ["proof-builder-failure", "case-148", "ethereum-mainnet"],
};

import type { ExtendedScenarioCase } from "../types";

export const demoCase078: ExtendedScenarioCase = {
  id: "extended-078",
  label: "Extended mock case 078 — proof builder outage",
  kind: "proof-builder-failure",
  description: "Deterministic demo scenario for proof builder outage; no live-chain assertion is made.",
  walletSeed: "extended-wallet-078",
  transactionSeed: "extended-tx-078",
  chain: "Ethereum Mainnet",
  facts: [
      { ageDays: 14, eventType: "REPAYMENT", amount: 3186, sourceBlockOffset: 780, verificationOffset: 1, freshness: "Aging" },
      { ageDays: 21, eventType: "COLLATERAL_DEPOSIT", amount: 3497, sourceBlockOffset: 793, verificationOffset: 2, freshness: "Aging" },
      { ageDays: 28, eventType: "REPAYMENT", amount: 3808, sourceBlockOffset: 806, verificationOffset: 3, freshness: "Aging" },
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
  tags: ["proof-builder-failure", "case-078", "ethereum-mainnet"],
};

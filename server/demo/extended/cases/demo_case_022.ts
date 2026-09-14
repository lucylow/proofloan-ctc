import type { ExtendedScenarioCase } from "../types";

export const demoCase022: ExtendedScenarioCase = {
  id: "extended-022",
  label: "Extended mock case 022 — proof builder outage",
  kind: "proof-builder-failure",
  description: "Deterministic demo scenario for proof builder outage; no live-chain assertion is made.",
  walletSeed: "extended-wallet-022",
  transactionSeed: "extended-tx-022",
  chain: "Ethereum Mainnet",
  facts: [
      { ageDays: 66, eventType: "REPAYMENT", amount: 3514, sourceBlockOffset: 220, verificationOffset: 1, freshness: "Aging" },
      { ageDays: 73, eventType: "COLLATERAL_DEPOSIT", amount: 3825, sourceBlockOffset: 233, verificationOffset: 2, freshness: "Aging" },
      { ageDays: 80, eventType: "REPAYMENT", amount: 4136, sourceBlockOffset: 246, verificationOffset: 3, freshness: "Aging" },
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
  tags: ["proof-builder-failure", "case-022", "ethereum-mainnet"],
};

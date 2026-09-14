import type { ExtendedScenarioCase } from "../types";

export const demoCase162: ExtendedScenarioCase = {
  id: "extended-162",
  label: "Extended mock case 162 — proof builder outage",
  kind: "proof-builder-failure",
  description: "Deterministic demo scenario for proof builder outage; no live-chain assertion is made.",
  walletSeed: "extended-wallet-162",
  transactionSeed: "extended-tx-162",
  chain: "Ethereum Mainnet",
  facts: [
      { ageDays: 46, eventType: "REPAYMENT", amount: 6694, sourceBlockOffset: 1620, verificationOffset: 1, freshness: "Aging" },
      { ageDays: 53, eventType: "COLLATERAL_DEPOSIT", amount: 7005, sourceBlockOffset: 1633, verificationOffset: 2, freshness: "Aging" },
      { ageDays: 60, eventType: "REPAYMENT", amount: 7316, sourceBlockOffset: 1646, verificationOffset: 3, freshness: "Aging" },
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
  tags: ["proof-builder-failure", "case-162", "ethereum-mainnet"],
};

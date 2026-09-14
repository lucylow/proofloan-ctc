import type { ExtendedScenarioCase } from "../types";

export const demoCase050: ExtendedScenarioCase = {
  id: "extended-050",
  label: "Extended mock case 050 — proof builder outage",
  kind: "proof-builder-failure",
  description: "Deterministic demo scenario for proof builder outage; no live-chain assertion is made.",
  walletSeed: "extended-wallet-050",
  transactionSeed: "extended-tx-050",
  chain: "Ethereum Mainnet",
  facts: [
      { ageDays: 150, eventType: "REPAYMENT", amount: 7350, sourceBlockOffset: 500, verificationOffset: 1, freshness: "Stale" },
      { ageDays: 157, eventType: "COLLATERAL_DEPOSIT", amount: 7661, sourceBlockOffset: 513, verificationOffset: 2, freshness: "Stale" },
      { ageDays: 164, eventType: "REPAYMENT", amount: 7972, sourceBlockOffset: 526, verificationOffset: 3, freshness: "Stale" },
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
  tags: ["proof-builder-failure", "case-050", "ethereum-mainnet"],
};

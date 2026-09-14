import type { ExtendedScenarioCase } from "../types";

export const demoCase043: ExtendedScenarioCase = {
  id: "extended-043",
  label: "Extended mock case 043 — stable repayment",
  kind: "happy-path",
  description: "Deterministic demo scenario for stable repayment; no live-chain assertion is made.",
  walletSeed: "extended-wallet-043",
  transactionSeed: "extended-tx-043",
  chain: "Ethereum Sepolia",
  facts: [
      { ageDays: 129, eventType: "REPAYMENT", amount: 6391, sourceBlockOffset: 430, verificationOffset: 1, freshness: "Stale" },
      { ageDays: 136, eventType: "COLLATERAL_DEPOSIT", amount: 6702, sourceBlockOffset: 443, verificationOffset: 2, freshness: "Stale" },
      { ageDays: 143, eventType: "REPAYMENT", amount: 7013, sourceBlockOffset: 456, verificationOffset: 3, freshness: "Stale" },
      { ageDays: 150, eventType: "REPAYMENT", amount: 7324, sourceBlockOffset: 469, verificationOffset: 4, freshness: "Stale" },
  ],
  expectations: {
    minEvidence: 4,
    freshness: undefined,
    requireFallback: false,
    allowOffer: true,
    requireAbstention: false,
    requirePolicyBlock: false,
  },
  tags: ["happy-path", "case-043", "ethereum-sepolia"],
};

import type { ExtendedScenarioCase } from "../types";

export const demoCase113: ExtendedScenarioCase = {
  id: "extended-113",
  label: "Extended mock case 113 — stable repayment",
  kind: "happy-path",
  description: "Deterministic demo scenario for stable repayment; no live-chain assertion is made.",
  walletSeed: "extended-wallet-113",
  transactionSeed: "extended-tx-113",
  chain: "Ethereum Sepolia",
  facts: [
      { ageDays: 119, eventType: "REPAYMENT", amount: 7981, sourceBlockOffset: 1130, verificationOffset: 1, freshness: "Stale" },
      { ageDays: 126, eventType: "COLLATERAL_DEPOSIT", amount: 8292, sourceBlockOffset: 1143, verificationOffset: 2, freshness: "Stale" },
  ],
  expectations: {
    minEvidence: 2,
    freshness: undefined,
    requireFallback: false,
    allowOffer: true,
    requireAbstention: false,
    requirePolicyBlock: false,
  },
  tags: ["happy-path", "case-113", "ethereum-sepolia"],
};

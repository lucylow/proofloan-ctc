import type { ExtendedScenarioCase } from "../types";

export const demoCase117: ExtendedScenarioCase = {
  id: "extended-117",
  label: "Extended mock case 117 — cross-chain history",
  kind: "cross-chain",
  description: "Deterministic demo scenario for cross-chain history; no live-chain assertion is made.",
  walletSeed: "extended-wallet-117",
  transactionSeed: "extended-tx-117",
  chain: "Ethereum Sepolia",
  facts: [
      { ageDays: 131, eventType: "REPAYMENT", amount: 529, sourceBlockOffset: 1170, verificationOffset: 1, freshness: "Stale" },
      { ageDays: 138, eventType: "COLLATERAL_DEPOSIT", amount: 840, sourceBlockOffset: 1183, verificationOffset: 2, freshness: "Stale" },
  ],
  expectations: {
    minEvidence: 2,
    freshness: undefined,
    requireFallback: false,
    allowOffer: true,
    requireAbstention: false,
    requirePolicyBlock: false,
  },
  tags: ["cross-chain", "case-117", "ethereum-sepolia"],
};

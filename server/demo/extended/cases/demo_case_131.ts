import type { ExtendedScenarioCase } from "../types";

export const demoCase131: ExtendedScenarioCase = {
  id: "extended-131",
  label: "Extended mock case 131 — cross-chain history",
  kind: "cross-chain",
  description: "Deterministic demo scenario for cross-chain history; no live-chain assertion is made.",
  walletSeed: "extended-wallet-131",
  transactionSeed: "extended-tx-131",
  chain: "Ethereum Sepolia",
  facts: [
      { ageDays: 173, eventType: "REPAYMENT", amount: 2447, sourceBlockOffset: 1310, verificationOffset: 1, freshness: "Stale" },
      { ageDays: 180, eventType: "COLLATERAL_DEPOSIT", amount: 2758, sourceBlockOffset: 1323, verificationOffset: 2, freshness: "Stale" },
      { ageDays: 187, eventType: "REPAYMENT", amount: 3069, sourceBlockOffset: 1336, verificationOffset: 3, freshness: "Stale" },
      { ageDays: 194, eventType: "REPAYMENT", amount: 3380, sourceBlockOffset: 1349, verificationOffset: 4, freshness: "Stale" },
  ],
  expectations: {
    minEvidence: 4,
    freshness: undefined,
    requireFallback: false,
    allowOffer: true,
    requireAbstention: false,
    requirePolicyBlock: false,
  },
  tags: ["cross-chain", "case-131", "ethereum-sepolia"],
};

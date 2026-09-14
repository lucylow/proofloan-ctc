import type { ExtendedScenarioCase } from "../types";

export const demoCase033: ExtendedScenarioCase = {
  id: "extended-033",
  label: "Extended mock case 033 — cross-chain history",
  kind: "cross-chain",
  description: "Deterministic demo scenario for cross-chain history; no live-chain assertion is made.",
  walletSeed: "extended-wallet-033",
  transactionSeed: "extended-tx-033",
  chain: "Ethereum Sepolia",
  facts: [
      { ageDays: 99, eventType: "REPAYMENT", amount: 5021, sourceBlockOffset: 330, verificationOffset: 1, freshness: "Stale" },
      { ageDays: 106, eventType: "COLLATERAL_DEPOSIT", amount: 5332, sourceBlockOffset: 343, verificationOffset: 2, freshness: "Stale" },
  ],
  expectations: {
    minEvidence: 2,
    freshness: undefined,
    requireFallback: false,
    allowOffer: true,
    requireAbstention: false,
    requirePolicyBlock: false,
  },
  tags: ["cross-chain", "case-033", "ethereum-sepolia"],
};

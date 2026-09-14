import type { ExtendedScenarioCase } from "../types";

export const demoCase061: ExtendedScenarioCase = {
  id: "extended-061",
  label: "Extended mock case 061 — cross-chain history",
  kind: "cross-chain",
  description: "Deterministic demo scenario for cross-chain history; no live-chain assertion is made.",
  walletSeed: "extended-wallet-061",
  transactionSeed: "extended-tx-061",
  chain: "Ethereum Sepolia",
  facts: [
      { ageDays: 183, eventType: "REPAYMENT", amount: 857, sourceBlockOffset: 610, verificationOffset: 1, freshness: "Stale" },
      { ageDays: 190, eventType: "COLLATERAL_DEPOSIT", amount: 1168, sourceBlockOffset: 623, verificationOffset: 2, freshness: "Stale" },
  ],
  expectations: {
    minEvidence: 2,
    freshness: undefined,
    requireFallback: false,
    allowOffer: true,
    requireAbstention: false,
    requirePolicyBlock: false,
  },
  tags: ["cross-chain", "case-061", "ethereum-sepolia"],
};

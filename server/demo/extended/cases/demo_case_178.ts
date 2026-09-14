import type { ExtendedScenarioCase } from "../types";

export const demoCase178: ExtendedScenarioCase = {
  id: "extended-178",
  label: "Extended mock case 178 — dense transaction block",
  kind: "merkle-pressure",
  description: "Deterministic demo scenario for dense transaction block; no live-chain assertion is made.",
  walletSeed: "extended-wallet-178",
  transactionSeed: "extended-tx-178",
  chain: "Ethereum Mainnet",
  facts: [
      { ageDays: 94, eventType: "REPAYMENT", amount: 886, sourceBlockOffset: 1780, verificationOffset: 1, freshness: "Stale" },
      { ageDays: 101, eventType: "COLLATERAL_DEPOSIT", amount: 1197, sourceBlockOffset: 1793, verificationOffset: 2, freshness: "Stale" },
      { ageDays: 108, eventType: "REPAYMENT", amount: 1508, sourceBlockOffset: 1806, verificationOffset: 3, freshness: "Stale" },
  ],
  expectations: {
    minEvidence: 3,
    freshness: undefined,
    requireFallback: false,
    allowOffer: true,
    requireAbstention: false,
    requirePolicyBlock: false,
  },
  tags: ["merkle-pressure", "case-178", "ethereum-mainnet"],
};

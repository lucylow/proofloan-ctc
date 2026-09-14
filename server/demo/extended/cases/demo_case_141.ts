import type { ExtendedScenarioCase } from "../types";

export const demoCase141: ExtendedScenarioCase = {
  id: "extended-141",
  label: "Extended mock case 141 — stable repayment",
  kind: "happy-path",
  description: "Deterministic demo scenario for stable repayment; no live-chain assertion is made.",
  walletSeed: "extended-wallet-141",
  transactionSeed: "extended-tx-141",
  chain: "Ethereum Sepolia",
  facts: [
      { ageDays: 203, eventType: "REPAYMENT", amount: 3817, sourceBlockOffset: 1410, verificationOffset: 1, freshness: "Stale" },
      { ageDays: 210, eventType: "COLLATERAL_DEPOSIT", amount: 4128, sourceBlockOffset: 1423, verificationOffset: 2, freshness: "Stale" },
  ],
  expectations: {
    minEvidence: 2,
    freshness: undefined,
    requireFallback: false,
    allowOffer: true,
    requireAbstention: false,
    requirePolicyBlock: false,
  },
  tags: ["happy-path", "case-141", "ethereum-sepolia"],
};

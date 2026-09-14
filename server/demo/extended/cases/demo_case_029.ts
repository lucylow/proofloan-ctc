import type { ExtendedScenarioCase } from "../types";

export const demoCase029: ExtendedScenarioCase = {
  id: "extended-029",
  label: "Extended mock case 029 — stable repayment",
  kind: "happy-path",
  description: "Deterministic demo scenario for stable repayment; no live-chain assertion is made.",
  walletSeed: "extended-wallet-029",
  transactionSeed: "extended-tx-029",
  chain: "Ethereum Sepolia",
  facts: [
      { ageDays: 87, eventType: "REPAYMENT", amount: 4473, sourceBlockOffset: 290, verificationOffset: 1, freshness: "Aging" },
      { ageDays: 94, eventType: "COLLATERAL_DEPOSIT", amount: 4784, sourceBlockOffset: 303, verificationOffset: 2, freshness: "Stale" },
  ],
  expectations: {
    minEvidence: 2,
    freshness: undefined,
    requireFallback: false,
    allowOffer: true,
    requireAbstention: false,
    requirePolicyBlock: false,
  },
  tags: ["happy-path", "case-029", "ethereum-sepolia"],
};

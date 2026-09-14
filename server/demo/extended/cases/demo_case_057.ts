import type { ExtendedScenarioCase } from "../types";

export const demoCase057: ExtendedScenarioCase = {
  id: "extended-057",
  label: "Extended mock case 057 — stable repayment",
  kind: "happy-path",
  description: "Deterministic demo scenario for stable repayment; no live-chain assertion is made.",
  walletSeed: "extended-wallet-057",
  transactionSeed: "extended-tx-057",
  chain: "Ethereum Sepolia",
  facts: [
      { ageDays: 171, eventType: "REPAYMENT", amount: 8309, sourceBlockOffset: 570, verificationOffset: 1, freshness: "Stale" },
      { ageDays: 178, eventType: "COLLATERAL_DEPOSIT", amount: 620, sourceBlockOffset: 583, verificationOffset: 2, freshness: "Stale" },
  ],
  expectations: {
    minEvidence: 2,
    freshness: undefined,
    requireFallback: false,
    allowOffer: true,
    requireAbstention: false,
    requirePolicyBlock: false,
  },
  tags: ["happy-path", "case-057", "ethereum-sepolia"],
};

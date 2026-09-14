import type { ExtendedScenarioCase } from "../types";

export const demoCase085: ExtendedScenarioCase = {
  id: "extended-085",
  label: "Extended mock case 085 — stable repayment",
  kind: "happy-path",
  description: "Deterministic demo scenario for stable repayment; no live-chain assertion is made.",
  walletSeed: "extended-wallet-085",
  transactionSeed: "extended-tx-085",
  chain: "Ethereum Sepolia",
  facts: [
      { ageDays: 35, eventType: "REPAYMENT", amount: 4145, sourceBlockOffset: 850, verificationOffset: 1, freshness: "Aging" },
      { ageDays: 42, eventType: "COLLATERAL_DEPOSIT", amount: 4456, sourceBlockOffset: 863, verificationOffset: 2, freshness: "Aging" },
  ],
  expectations: {
    minEvidence: 2,
    freshness: undefined,
    requireFallback: false,
    allowOffer: true,
    requireAbstention: false,
    requirePolicyBlock: false,
  },
  tags: ["happy-path", "case-085", "ethereum-sepolia"],
};

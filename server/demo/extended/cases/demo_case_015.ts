import type { ExtendedScenarioCase } from "../types";

export const demoCase015: ExtendedScenarioCase = {
  id: "extended-015",
  label: "Extended mock case 015 — stable repayment",
  kind: "happy-path",
  description: "Deterministic demo scenario for stable repayment; no live-chain assertion is made.",
  walletSeed: "extended-wallet-015",
  transactionSeed: "extended-tx-015",
  chain: "Ethereum Sepolia",
  facts: [
      { ageDays: 45, eventType: "REPAYMENT", amount: 2555, sourceBlockOffset: 150, verificationOffset: 1, freshness: "Aging" },
      { ageDays: 52, eventType: "COLLATERAL_DEPOSIT", amount: 2866, sourceBlockOffset: 163, verificationOffset: 2, freshness: "Aging" },
      { ageDays: 59, eventType: "REPAYMENT", amount: 3177, sourceBlockOffset: 176, verificationOffset: 3, freshness: "Aging" },
      { ageDays: 66, eventType: "REPAYMENT", amount: 3488, sourceBlockOffset: 189, verificationOffset: 4, freshness: "Aging" },
  ],
  expectations: {
    minEvidence: 4,
    freshness: undefined,
    requireFallback: false,
    allowOffer: true,
    requireAbstention: false,
    requirePolicyBlock: false,
  },
  tags: ["happy-path", "case-015", "ethereum-sepolia"],
};

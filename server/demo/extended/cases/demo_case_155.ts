import type { ExtendedScenarioCase } from "../types";

export const demoCase155: ExtendedScenarioCase = {
  id: "extended-155",
  label: "Extended mock case 155 — stable repayment",
  kind: "happy-path",
  description: "Deterministic demo scenario for stable repayment; no live-chain assertion is made.",
  walletSeed: "extended-wallet-155",
  transactionSeed: "extended-tx-155",
  chain: "Ethereum Sepolia",
  facts: [
      { ageDays: 25, eventType: "REPAYMENT", amount: 5735, sourceBlockOffset: 1550, verificationOffset: 1, freshness: "Aging" },
      { ageDays: 32, eventType: "COLLATERAL_DEPOSIT", amount: 6046, sourceBlockOffset: 1563, verificationOffset: 2, freshness: "Aging" },
      { ageDays: 39, eventType: "REPAYMENT", amount: 6357, sourceBlockOffset: 1576, verificationOffset: 3, freshness: "Aging" },
      { ageDays: 46, eventType: "REPAYMENT", amount: 6668, sourceBlockOffset: 1589, verificationOffset: 4, freshness: "Aging" },
  ],
  expectations: {
    minEvidence: 4,
    freshness: undefined,
    requireFallback: false,
    allowOffer: true,
    requireAbstention: false,
    requirePolicyBlock: false,
  },
  tags: ["happy-path", "case-155", "ethereum-sepolia"],
};

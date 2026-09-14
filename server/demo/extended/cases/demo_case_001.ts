import type { ExtendedScenarioCase } from "../types";

export const demoCase001: ExtendedScenarioCase = {
  id: "extended-001",
  label: "Extended mock case 001 — stable repayment",
  kind: "happy-path",
  description: "Deterministic demo scenario for stable repayment; no live-chain assertion is made.",
  walletSeed: "extended-wallet-001",
  transactionSeed: "extended-tx-001",
  chain: "Ethereum Sepolia",
  facts: [
      { ageDays: 3, eventType: "REPAYMENT", amount: 637, sourceBlockOffset: 10, verificationOffset: 1, freshness: "Fresh" },
      { ageDays: 10, eventType: "COLLATERAL_DEPOSIT", amount: 948, sourceBlockOffset: 23, verificationOffset: 2, freshness: "Aging" },
  ],
  expectations: {
    minEvidence: 2,
    freshness: undefined,
    requireFallback: false,
    allowOffer: true,
    requireAbstention: false,
    requirePolicyBlock: false,
  },
  tags: ["happy-path", "case-001", "ethereum-sepolia"],
};

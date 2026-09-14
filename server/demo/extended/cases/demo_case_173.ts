import type { ExtendedScenarioCase } from "../types";

export const demoCase173: ExtendedScenarioCase = {
  id: "extended-173",
  label: "Extended mock case 173 — cross-chain history",
  kind: "cross-chain",
  description: "Deterministic demo scenario for cross-chain history; no live-chain assertion is made.",
  walletSeed: "extended-wallet-173",
  transactionSeed: "extended-tx-173",
  chain: "Ethereum Sepolia",
  facts: [
      { ageDays: 79, eventType: "REPAYMENT", amount: 8201, sourceBlockOffset: 1730, verificationOffset: 1, freshness: "Aging" },
      { ageDays: 86, eventType: "COLLATERAL_DEPOSIT", amount: 512, sourceBlockOffset: 1743, verificationOffset: 2, freshness: "Aging" },
  ],
  expectations: {
    minEvidence: 2,
    freshness: undefined,
    requireFallback: false,
    allowOffer: true,
    requireAbstention: false,
    requirePolicyBlock: false,
  },
  tags: ["cross-chain", "case-173", "ethereum-sepolia"],
};

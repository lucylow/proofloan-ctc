import type { ExtendedScenarioCase } from "../types";

export const demoCase014: ExtendedScenarioCase = {
  id: "extended-014",
  label: "Extended mock case 014 — reorg recovery",
  kind: "reorg-recovery",
  description: "Deterministic demo scenario for reorg recovery; no live-chain assertion is made.",
  walletSeed: "extended-wallet-014",
  transactionSeed: "extended-tx-014",
  chain: "Ethereum Sepolia",
  facts: [
      { ageDays: 42, eventType: "REPAYMENT", amount: 2418, sourceBlockOffset: 140, verificationOffset: 1, freshness: "Aging" },
      { ageDays: 49, eventType: "COLLATERAL_DEPOSIT", amount: 2729, sourceBlockOffset: 153, verificationOffset: 2, freshness: "Aging" },
      { ageDays: 56, eventType: "REPAYMENT", amount: 3040, sourceBlockOffset: 166, verificationOffset: 3, freshness: "Aging" },
  ],
    failure: { kind: "rpc", message: "Synthetic reorg detected", retryAfterMs: 4000 },
  expectations: {
    minEvidence: 3,
    freshness: undefined,
    requireFallback: true,
    allowOffer: true,
    requireAbstention: false,
    requirePolicyBlock: false,
  },
  tags: ["reorg-recovery", "case-014", "ethereum-sepolia"],
};

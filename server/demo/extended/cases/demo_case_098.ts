import type { ExtendedScenarioCase } from "../types";

export const demoCase098: ExtendedScenarioCase = {
  id: "extended-098",
  label: "Extended mock case 098 — reorg recovery",
  kind: "reorg-recovery",
  description: "Deterministic demo scenario for reorg recovery; no live-chain assertion is made.",
  walletSeed: "extended-wallet-098",
  transactionSeed: "extended-tx-098",
  chain: "Ethereum Sepolia",
  facts: [
      { ageDays: 74, eventType: "REPAYMENT", amount: 5926, sourceBlockOffset: 980, verificationOffset: 1, freshness: "Aging" },
      { ageDays: 81, eventType: "COLLATERAL_DEPOSIT", amount: 6237, sourceBlockOffset: 993, verificationOffset: 2, freshness: "Aging" },
      { ageDays: 88, eventType: "REPAYMENT", amount: 6548, sourceBlockOffset: 1006, verificationOffset: 3, freshness: "Aging" },
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
  tags: ["reorg-recovery", "case-098", "ethereum-sepolia"],
};

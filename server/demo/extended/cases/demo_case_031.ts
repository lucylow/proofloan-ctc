import type { ExtendedScenarioCase } from "../types";

export const demoCase031: ExtendedScenarioCase = {
  id: "extended-031",
  label: "Extended mock case 031 — late payment",
  kind: "late-payment",
  description: "Deterministic demo scenario for late payment; no live-chain assertion is made.",
  walletSeed: "extended-wallet-031",
  transactionSeed: "extended-tx-031",
  chain: "Ethereum Sepolia",
  facts: [
      { ageDays: 93, eventType: "LATE_PAYMENT", amount: 4747, sourceBlockOffset: 310, verificationOffset: 1, freshness: "Stale" },
      { ageDays: 100, eventType: "COLLATERAL_DEPOSIT", amount: 5058, sourceBlockOffset: 323, verificationOffset: 2, freshness: "Stale" },
      { ageDays: 107, eventType: "REPAYMENT", amount: 5369, sourceBlockOffset: 336, verificationOffset: 3, freshness: "Stale" },
      { ageDays: 114, eventType: "REPAYMENT", amount: 5680, sourceBlockOffset: 349, verificationOffset: 4, freshness: "Stale" },
  ],
  expectations: {
    minEvidence: 4,
    freshness: undefined,
    requireFallback: false,
    allowOffer: true,
    requireAbstention: false,
    requirePolicyBlock: false,
  },
  tags: ["late-payment", "case-031", "ethereum-sepolia"],
};

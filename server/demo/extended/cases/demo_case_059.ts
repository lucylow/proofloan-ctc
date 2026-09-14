import type { ExtendedScenarioCase } from "../types";

export const demoCase059: ExtendedScenarioCase = {
  id: "extended-059",
  label: "Extended mock case 059 — late payment",
  kind: "late-payment",
  description: "Deterministic demo scenario for late payment; no live-chain assertion is made.",
  walletSeed: "extended-wallet-059",
  transactionSeed: "extended-tx-059",
  chain: "Ethereum Sepolia",
  facts: [
      { ageDays: 177, eventType: "LATE_PAYMENT", amount: 583, sourceBlockOffset: 590, verificationOffset: 1, freshness: "Stale" },
      { ageDays: 184, eventType: "COLLATERAL_DEPOSIT", amount: 894, sourceBlockOffset: 603, verificationOffset: 2, freshness: "Stale" },
      { ageDays: 191, eventType: "REPAYMENT", amount: 1205, sourceBlockOffset: 616, verificationOffset: 3, freshness: "Stale" },
      { ageDays: 198, eventType: "REPAYMENT", amount: 1516, sourceBlockOffset: 629, verificationOffset: 4, freshness: "Stale" },
  ],
  expectations: {
    minEvidence: 4,
    freshness: undefined,
    requireFallback: false,
    allowOffer: true,
    requireAbstention: false,
    requirePolicyBlock: false,
  },
  tags: ["late-payment", "case-059", "ethereum-sepolia"],
};

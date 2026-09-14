import type { ExtendedScenarioCase } from "../types";

export const demoCase073: ExtendedScenarioCase = {
  id: "extended-073",
  label: "Extended mock case 073 — late payment",
  kind: "late-payment",
  description: "Deterministic demo scenario for late payment; no live-chain assertion is made.",
  walletSeed: "extended-wallet-073",
  transactionSeed: "extended-tx-073",
  chain: "Ethereum Sepolia",
  facts: [
      { ageDays: 219, eventType: "LATE_PAYMENT", amount: 2501, sourceBlockOffset: 730, verificationOffset: 1, freshness: "Stale" },
      { ageDays: 6, eventType: "COLLATERAL_DEPOSIT", amount: 2812, sourceBlockOffset: 743, verificationOffset: 2, freshness: "Fresh" },
  ],
  expectations: {
    minEvidence: 2,
    freshness: undefined,
    requireFallback: false,
    allowOffer: true,
    requireAbstention: false,
    requirePolicyBlock: false,
  },
  tags: ["late-payment", "case-073", "ethereum-sepolia"],
};

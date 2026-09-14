import type { ExtendedScenarioCase } from "../types";

export const demoCase129: ExtendedScenarioCase = {
  id: "extended-129",
  label: "Extended mock case 129 — late payment",
  kind: "late-payment",
  description: "Deterministic demo scenario for late payment; no live-chain assertion is made.",
  walletSeed: "extended-wallet-129",
  transactionSeed: "extended-tx-129",
  chain: "Ethereum Sepolia",
  facts: [
      { ageDays: 167, eventType: "LATE_PAYMENT", amount: 2173, sourceBlockOffset: 1290, verificationOffset: 1, freshness: "Stale" },
      { ageDays: 174, eventType: "COLLATERAL_DEPOSIT", amount: 2484, sourceBlockOffset: 1303, verificationOffset: 2, freshness: "Stale" },
  ],
  expectations: {
    minEvidence: 2,
    freshness: undefined,
    requireFallback: false,
    allowOffer: true,
    requireAbstention: false,
    requirePolicyBlock: false,
  },
  tags: ["late-payment", "case-129", "ethereum-sepolia"],
};

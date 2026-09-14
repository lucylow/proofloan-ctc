import type { ExtendedScenarioCase } from "../types";

export const demoCase124: ExtendedScenarioCase = {
  id: "extended-124",
  label: "Extended mock case 124 — policy rejection",
  kind: "riskguard-block",
  description: "Deterministic demo scenario for policy rejection; no live-chain assertion is made.",
  walletSeed: "extended-wallet-124",
  transactionSeed: "extended-tx-124",
  chain: "Ethereum Mainnet",
  facts: [
      { ageDays: 152, eventType: "LATE_PAYMENT", amount: 700, sourceBlockOffset: 1240, verificationOffset: 1, freshness: "Stale" },
  ],
  expectations: {
    minEvidence: 1,
    freshness: undefined,
    requireFallback: false,
    allowOffer: false,
    requireAbstention: false,
    requirePolicyBlock: true,
  },
  tags: ["riskguard-block", "case-124", "ethereum-mainnet"],
};

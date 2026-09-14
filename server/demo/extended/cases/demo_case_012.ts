import type { ExtendedScenarioCase } from "../types";

export const demoCase012: ExtendedScenarioCase = {
  id: "extended-012",
  label: "Extended mock case 012 — policy rejection",
  kind: "riskguard-block",
  description: "Deterministic demo scenario for policy rejection; no live-chain assertion is made.",
  walletSeed: "extended-wallet-012",
  transactionSeed: "extended-tx-012",
  chain: "Ethereum Mainnet",
  facts: [
      { ageDays: 36, eventType: "LATE_PAYMENT", amount: 714, sourceBlockOffset: 120, verificationOffset: 1, freshness: "Aging" },
  ],
  expectations: {
    minEvidence: 1,
    freshness: undefined,
    requireFallback: false,
    allowOffer: false,
    requireAbstention: false,
    requirePolicyBlock: true,
  },
  tags: ["riskguard-block", "case-012", "ethereum-mainnet"],
};

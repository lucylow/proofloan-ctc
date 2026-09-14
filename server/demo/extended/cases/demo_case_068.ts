import type { ExtendedScenarioCase } from "../types";

export const demoCase068: ExtendedScenarioCase = {
  id: "extended-068",
  label: "Extended mock case 068 — policy rejection",
  kind: "riskguard-block",
  description: "Deterministic demo scenario for policy rejection; no live-chain assertion is made.",
  walletSeed: "extended-wallet-068",
  transactionSeed: "extended-tx-068",
  chain: "Ethereum Mainnet",
  facts: [
      { ageDays: 204, eventType: "LATE_PAYMENT", amount: 700, sourceBlockOffset: 680, verificationOffset: 1, freshness: "Stale" },
  ],
  expectations: {
    minEvidence: 1,
    freshness: undefined,
    requireFallback: false,
    allowOffer: false,
    requireAbstention: false,
    requirePolicyBlock: true,
  },
  tags: ["riskguard-block", "case-068", "ethereum-mainnet"],
};

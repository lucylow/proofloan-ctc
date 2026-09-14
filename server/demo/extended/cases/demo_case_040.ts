import type { ExtendedScenarioCase } from "../types";

export const demoCase040: ExtendedScenarioCase = {
  id: "extended-040",
  label: "Extended mock case 040 — policy rejection",
  kind: "riskguard-block",
  description: "Deterministic demo scenario for policy rejection; no live-chain assertion is made.",
  walletSeed: "extended-wallet-040",
  transactionSeed: "extended-tx-040",
  chain: "Ethereum Mainnet",
  facts: [
      { ageDays: 120, eventType: "LATE_PAYMENT", amount: 1993, sourceBlockOffset: 400, verificationOffset: 1, freshness: "Stale" },
  ],
  expectations: {
    minEvidence: 1,
    freshness: undefined,
    requireFallback: false,
    allowOffer: false,
    requireAbstention: false,
    requirePolicyBlock: true,
  },
  tags: ["riskguard-block", "case-040", "ethereum-mainnet"],
};

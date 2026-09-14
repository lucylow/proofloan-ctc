import type { ExtendedScenarioCase } from "../types";

export const demoCase180: ExtendedScenarioCase = {
  id: "extended-180",
  label: "Extended mock case 180 — policy rejection",
  kind: "riskguard-block",
  description: "Deterministic demo scenario for policy rejection; no live-chain assertion is made.",
  walletSeed: "extended-wallet-180",
  transactionSeed: "extended-tx-180",
  chain: "Ethereum Mainnet",
  facts: [
      { ageDays: 100, eventType: "LATE_PAYMENT", amount: 700, sourceBlockOffset: 1800, verificationOffset: 1, freshness: "Stale" },
  ],
  expectations: {
    minEvidence: 1,
    freshness: undefined,
    requireFallback: false,
    allowOffer: false,
    requireAbstention: false,
    requirePolicyBlock: true,
  },
  tags: ["riskguard-block", "case-180", "ethereum-mainnet"],
};

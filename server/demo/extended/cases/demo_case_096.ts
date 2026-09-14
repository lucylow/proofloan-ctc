import type { ExtendedScenarioCase } from "../types";

export const demoCase096: ExtendedScenarioCase = {
  id: "extended-096",
  label: "Extended mock case 096 — policy rejection",
  kind: "riskguard-block",
  description: "Deterministic demo scenario for policy rejection; no live-chain assertion is made.",
  walletSeed: "extended-wallet-096",
  transactionSeed: "extended-tx-096",
  chain: "Ethereum Mainnet",
  facts: [
      { ageDays: 68, eventType: "LATE_PAYMENT", amount: 1884, sourceBlockOffset: 960, verificationOffset: 1, freshness: "Aging" },
  ],
  expectations: {
    minEvidence: 1,
    freshness: undefined,
    requireFallback: false,
    allowOffer: false,
    requireAbstention: false,
    requirePolicyBlock: true,
  },
  tags: ["riskguard-block", "case-096", "ethereum-mainnet"],
};

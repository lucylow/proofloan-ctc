import type { ExtendedScenarioCase } from "../types";

export const demoCase152: ExtendedScenarioCase = {
  id: "extended-152",
  label: "Extended mock case 152 — policy rejection",
  kind: "riskguard-block",
  description: "Deterministic demo scenario for policy rejection; no live-chain assertion is made.",
  walletSeed: "extended-wallet-152",
  transactionSeed: "extended-tx-152",
  chain: "Ethereum Mainnet",
  facts: [
      { ageDays: 16, eventType: "LATE_PAYMENT", amount: 1774, sourceBlockOffset: 1520, verificationOffset: 1, freshness: "Aging" },
  ],
  expectations: {
    minEvidence: 1,
    freshness: undefined,
    requireFallback: false,
    allowOffer: false,
    requireAbstention: false,
    requirePolicyBlock: true,
  },
  tags: ["riskguard-block", "case-152", "ethereum-mainnet"],
};

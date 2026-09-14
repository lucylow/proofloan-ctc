import type { ExtendedScenarioCase } from "../types";

export const demoCase108: ExtendedScenarioCase = {
  id: "extended-108",
  label: "Extended mock case 108 — dense transaction block",
  kind: "merkle-pressure",
  description: "Deterministic demo scenario for dense transaction block; no live-chain assertion is made.",
  walletSeed: "extended-wallet-108",
  transactionSeed: "extended-tx-108",
  chain: "Ethereum Mainnet",
  facts: [
      { ageDays: 104, eventType: "REPAYMENT", amount: 7296, sourceBlockOffset: 1080, verificationOffset: 1, freshness: "Stale" },
  ],
  expectations: {
    minEvidence: 1,
    freshness: undefined,
    requireFallback: false,
    allowOffer: true,
    requireAbstention: false,
    requirePolicyBlock: false,
  },
  tags: ["merkle-pressure", "case-108", "ethereum-mainnet"],
};

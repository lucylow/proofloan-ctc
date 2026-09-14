import type { ExtendedScenarioCase } from "../types";

export const demoCase052: ExtendedScenarioCase = {
  id: "extended-052",
  label: "Extended mock case 052 — dense transaction block",
  kind: "merkle-pressure",
  description: "Deterministic demo scenario for dense transaction block; no live-chain assertion is made.",
  walletSeed: "extended-wallet-052",
  transactionSeed: "extended-tx-052",
  chain: "Ethereum Mainnet",
  facts: [
      { ageDays: 156, eventType: "REPAYMENT", amount: 7624, sourceBlockOffset: 520, verificationOffset: 1, freshness: "Stale" },
  ],
  expectations: {
    minEvidence: 1,
    freshness: undefined,
    requireFallback: false,
    allowOffer: true,
    requireAbstention: false,
    requirePolicyBlock: false,
  },
  tags: ["merkle-pressure", "case-052", "ethereum-mainnet"],
};

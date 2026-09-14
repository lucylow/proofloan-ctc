import type { ExtendedScenarioCase } from "../types";

export const demoCase164: ExtendedScenarioCase = {
  id: "extended-164",
  label: "Extended mock case 164 — dense transaction block",
  kind: "merkle-pressure",
  description: "Deterministic demo scenario for dense transaction block; no live-chain assertion is made.",
  walletSeed: "extended-wallet-164",
  transactionSeed: "extended-tx-164",
  chain: "Ethereum Mainnet",
  facts: [
      { ageDays: 52, eventType: "REPAYMENT", amount: 6968, sourceBlockOffset: 1640, verificationOffset: 1, freshness: "Aging" },
  ],
  expectations: {
    minEvidence: 1,
    freshness: undefined,
    requireFallback: false,
    allowOffer: true,
    requireAbstention: false,
    requirePolicyBlock: false,
  },
  tags: ["merkle-pressure", "case-164", "ethereum-mainnet"],
};

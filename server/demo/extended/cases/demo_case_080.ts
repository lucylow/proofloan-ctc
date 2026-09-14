import type { ExtendedScenarioCase } from "../types";

export const demoCase080: ExtendedScenarioCase = {
  id: "extended-080",
  label: "Extended mock case 080 — dense transaction block",
  kind: "merkle-pressure",
  description: "Deterministic demo scenario for dense transaction block; no live-chain assertion is made.",
  walletSeed: "extended-wallet-080",
  transactionSeed: "extended-tx-080",
  chain: "Ethereum Mainnet",
  facts: [
      { ageDays: 20, eventType: "REPAYMENT", amount: 3460, sourceBlockOffset: 800, verificationOffset: 1, freshness: "Aging" },
  ],
  expectations: {
    minEvidence: 1,
    freshness: undefined,
    requireFallback: false,
    allowOffer: true,
    requireAbstention: false,
    requirePolicyBlock: false,
  },
  tags: ["merkle-pressure", "case-080", "ethereum-mainnet"],
};

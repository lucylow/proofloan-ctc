import type { ExtendedScenarioCase } from "../types";

export const demoCase024: ExtendedScenarioCase = {
  id: "extended-024",
  label: "Extended mock case 024 — dense transaction block",
  kind: "merkle-pressure",
  description: "Deterministic demo scenario for dense transaction block; no live-chain assertion is made.",
  walletSeed: "extended-wallet-024",
  transactionSeed: "extended-tx-024",
  chain: "Ethereum Mainnet",
  facts: [
      { ageDays: 72, eventType: "REPAYMENT", amount: 3788, sourceBlockOffset: 240, verificationOffset: 1, freshness: "Aging" },
  ],
  expectations: {
    minEvidence: 1,
    freshness: undefined,
    requireFallback: false,
    allowOffer: true,
    requireAbstention: false,
    requirePolicyBlock: false,
  },
  tags: ["merkle-pressure", "case-024", "ethereum-mainnet"],
};

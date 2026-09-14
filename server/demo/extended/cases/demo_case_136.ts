import type { ExtendedScenarioCase } from "../types";

export const demoCase136: ExtendedScenarioCase = {
  id: "extended-136",
  label: "Extended mock case 136 — dense transaction block",
  kind: "merkle-pressure",
  description: "Deterministic demo scenario for dense transaction block; no live-chain assertion is made.",
  walletSeed: "extended-wallet-136",
  transactionSeed: "extended-tx-136",
  chain: "Ethereum Mainnet",
  facts: [
      { ageDays: 188, eventType: "REPAYMENT", amount: 3132, sourceBlockOffset: 1360, verificationOffset: 1, freshness: "Stale" },
  ],
  expectations: {
    minEvidence: 1,
    freshness: undefined,
    requireFallback: false,
    allowOffer: true,
    requireAbstention: false,
    requirePolicyBlock: false,
  },
  tags: ["merkle-pressure", "case-136", "ethereum-mainnet"],
};

import type { ExtendedScenarioCase } from "../types";

export const demoCase032: ExtendedScenarioCase = {
  id: "extended-032",
  label: "Extended mock case 032 — sparse evidence",
  kind: "sparse-evidence",
  description: "Deterministic demo scenario for sparse evidence; no live-chain assertion is made.",
  walletSeed: "extended-wallet-032",
  transactionSeed: "extended-tx-032",
  chain: "Ethereum Sepolia",
  facts: [
      { ageDays: 2, eventType: "REPAYMENT", amount: 400, sourceBlockOffset: 320, verificationOffset: 2 },
  ],
  expectations: {
    minEvidence: 1,
    freshness: undefined,
    requireFallback: false,
    allowOffer: true,
    requireAbstention: false,
    requirePolicyBlock: false,
  },
  tags: ["sparse-evidence", "case-032", "ethereum-sepolia"],
};

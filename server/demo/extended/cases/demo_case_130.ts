import type { ExtendedScenarioCase } from "../types";

export const demoCase130: ExtendedScenarioCase = {
  id: "extended-130",
  label: "Extended mock case 130 — sparse evidence",
  kind: "sparse-evidence",
  description: "Deterministic demo scenario for sparse evidence; no live-chain assertion is made.",
  walletSeed: "extended-wallet-130",
  transactionSeed: "extended-tx-130",
  chain: "Ethereum Sepolia",
  facts: [
      { ageDays: 2, eventType: "REPAYMENT", amount: 400, sourceBlockOffset: 1300, verificationOffset: 2 },
  ],
  expectations: {
    minEvidence: 1,
    freshness: undefined,
    requireFallback: false,
    allowOffer: true,
    requireAbstention: false,
    requirePolicyBlock: false,
  },
  tags: ["sparse-evidence", "case-130", "ethereum-sepolia"],
};

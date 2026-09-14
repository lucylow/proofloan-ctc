import type { ExtendedScenarioCase } from "../types";

export const demoCase116: ExtendedScenarioCase = {
  id: "extended-116",
  label: "Extended mock case 116 — sparse evidence",
  kind: "sparse-evidence",
  description: "Deterministic demo scenario for sparse evidence; no live-chain assertion is made.",
  walletSeed: "extended-wallet-116",
  transactionSeed: "extended-tx-116",
  chain: "Ethereum Sepolia",
  facts: [
      { ageDays: 2, eventType: "REPAYMENT", amount: 400, sourceBlockOffset: 1160, verificationOffset: 2 },
  ],
  expectations: {
    minEvidence: 1,
    freshness: undefined,
    requireFallback: false,
    allowOffer: true,
    requireAbstention: false,
    requirePolicyBlock: false,
  },
  tags: ["sparse-evidence", "case-116", "ethereum-sepolia"],
};

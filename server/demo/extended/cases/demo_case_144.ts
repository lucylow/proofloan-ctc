import type { ExtendedScenarioCase } from "../types";

export const demoCase144: ExtendedScenarioCase = {
  id: "extended-144",
  label: "Extended mock case 144 — sparse evidence",
  kind: "sparse-evidence",
  description: "Deterministic demo scenario for sparse evidence; no live-chain assertion is made.",
  walletSeed: "extended-wallet-144",
  transactionSeed: "extended-tx-144",
  chain: "Ethereum Sepolia",
  facts: [
      { ageDays: 2, eventType: "REPAYMENT", amount: 400, sourceBlockOffset: 1440, verificationOffset: 2 },
  ],
  expectations: {
    minEvidence: 1,
    freshness: undefined,
    requireFallback: false,
    allowOffer: true,
    requireAbstention: false,
    requirePolicyBlock: false,
  },
  tags: ["sparse-evidence", "case-144", "ethereum-sepolia"],
};

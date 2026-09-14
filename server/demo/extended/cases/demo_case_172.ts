import type { ExtendedScenarioCase } from "../types";

export const demoCase172: ExtendedScenarioCase = {
  id: "extended-172",
  label: "Extended mock case 172 — sparse evidence",
  kind: "sparse-evidence",
  description: "Deterministic demo scenario for sparse evidence; no live-chain assertion is made.",
  walletSeed: "extended-wallet-172",
  transactionSeed: "extended-tx-172",
  chain: "Ethereum Sepolia",
  facts: [
      { ageDays: 2, eventType: "REPAYMENT", amount: 400, sourceBlockOffset: 1720, verificationOffset: 2 },
  ],
  expectations: {
    minEvidence: 1,
    freshness: undefined,
    requireFallback: false,
    allowOffer: true,
    requireAbstention: false,
    requirePolicyBlock: false,
  },
  tags: ["sparse-evidence", "case-172", "ethereum-sepolia"],
};

import type { ExtendedScenarioCase } from "../types";

export const demoCase094: ExtendedScenarioCase = {
  id: "extended-094",
  label: "Extended mock case 094 — dense transaction block",
  kind: "merkle-pressure",
  description: "Deterministic demo scenario for dense transaction block; no live-chain assertion is made.",
  walletSeed: "extended-wallet-094",
  transactionSeed: "extended-tx-094",
  chain: "Ethereum Mainnet",
  facts: [
      { ageDays: 62, eventType: "REPAYMENT", amount: 5378, sourceBlockOffset: 940, verificationOffset: 1, freshness: "Aging" },
      { ageDays: 69, eventType: "COLLATERAL_DEPOSIT", amount: 5689, sourceBlockOffset: 953, verificationOffset: 2, freshness: "Aging" },
      { ageDays: 76, eventType: "REPAYMENT", amount: 6000, sourceBlockOffset: 966, verificationOffset: 3, freshness: "Aging" },
  ],
  expectations: {
    minEvidence: 3,
    freshness: undefined,
    requireFallback: false,
    allowOffer: true,
    requireAbstention: false,
    requirePolicyBlock: false,
  },
  tags: ["merkle-pressure", "case-094", "ethereum-mainnet"],
};

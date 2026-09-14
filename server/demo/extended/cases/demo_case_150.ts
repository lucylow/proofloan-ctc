import type { ExtendedScenarioCase } from "../types";

export const demoCase150: ExtendedScenarioCase = {
  id: "extended-150",
  label: "Extended mock case 150 — dense transaction block",
  kind: "merkle-pressure",
  description: "Deterministic demo scenario for dense transaction block; no live-chain assertion is made.",
  walletSeed: "extended-wallet-150",
  transactionSeed: "extended-tx-150",
  chain: "Ethereum Mainnet",
  facts: [
      { ageDays: 10, eventType: "REPAYMENT", amount: 5050, sourceBlockOffset: 1500, verificationOffset: 1, freshness: "Aging" },
      { ageDays: 17, eventType: "COLLATERAL_DEPOSIT", amount: 5361, sourceBlockOffset: 1513, verificationOffset: 2, freshness: "Aging" },
      { ageDays: 24, eventType: "REPAYMENT", amount: 5672, sourceBlockOffset: 1526, verificationOffset: 3, freshness: "Aging" },
  ],
  expectations: {
    minEvidence: 3,
    freshness: undefined,
    requireFallback: false,
    allowOffer: true,
    requireAbstention: false,
    requirePolicyBlock: false,
  },
  tags: ["merkle-pressure", "case-150", "ethereum-mainnet"],
};

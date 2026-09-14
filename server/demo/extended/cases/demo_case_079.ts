import type { ExtendedScenarioCase } from "../types";

export const demoCase079: ExtendedScenarioCase = {
  id: "extended-079",
  label: "Extended mock case 079 — long continuity",
  kind: "gas-pressure",
  description: "Deterministic demo scenario for long continuity; no live-chain assertion is made.",
  walletSeed: "extended-wallet-079",
  transactionSeed: "extended-tx-079",
  chain: "Ethereum Mainnet",
  facts: [
      { ageDays: 17, eventType: "REPAYMENT", amount: 3323, sourceBlockOffset: 790, verificationOffset: 1, freshness: "Aging" },
      { ageDays: 24, eventType: "COLLATERAL_DEPOSIT", amount: 3634, sourceBlockOffset: 803, verificationOffset: 2, freshness: "Aging" },
      { ageDays: 31, eventType: "REPAYMENT", amount: 3945, sourceBlockOffset: 816, verificationOffset: 3, freshness: "Aging" },
      { ageDays: 38, eventType: "REPAYMENT", amount: 4256, sourceBlockOffset: 829, verificationOffset: 4, freshness: "Aging" },
  ],
  expectations: {
    minEvidence: 4,
    freshness: "Stale",
    requireFallback: false,
    allowOffer: true,
    requireAbstention: false,
    requirePolicyBlock: false,
  },
  tags: ["gas-pressure", "case-079", "ethereum-mainnet"],
};

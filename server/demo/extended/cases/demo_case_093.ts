import type { ExtendedScenarioCase } from "../types";

export const demoCase093: ExtendedScenarioCase = {
  id: "extended-093",
  label: "Extended mock case 093 — long continuity",
  kind: "gas-pressure",
  description: "Deterministic demo scenario for long continuity; no live-chain assertion is made.",
  walletSeed: "extended-wallet-093",
  transactionSeed: "extended-tx-093",
  chain: "Ethereum Mainnet",
  facts: [
      { ageDays: 59, eventType: "REPAYMENT", amount: 5241, sourceBlockOffset: 930, verificationOffset: 1, freshness: "Aging" },
      { ageDays: 66, eventType: "COLLATERAL_DEPOSIT", amount: 5552, sourceBlockOffset: 943, verificationOffset: 2, freshness: "Aging" },
  ],
  expectations: {
    minEvidence: 2,
    freshness: "Stale",
    requireFallback: false,
    allowOffer: true,
    requireAbstention: false,
    requirePolicyBlock: false,
  },
  tags: ["gas-pressure", "case-093", "ethereum-mainnet"],
};

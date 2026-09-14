import type { ExtendedScenarioCase } from "../types";

export const demoCase009: ExtendedScenarioCase = {
  id: "extended-009",
  label: "Extended mock case 009 — long continuity",
  kind: "gas-pressure",
  description: "Deterministic demo scenario for long continuity; no live-chain assertion is made.",
  walletSeed: "extended-wallet-009",
  transactionSeed: "extended-tx-009",
  chain: "Ethereum Mainnet",
  facts: [
      { ageDays: 27, eventType: "REPAYMENT", amount: 1733, sourceBlockOffset: 90, verificationOffset: 1, freshness: "Aging" },
      { ageDays: 34, eventType: "COLLATERAL_DEPOSIT", amount: 2044, sourceBlockOffset: 103, verificationOffset: 2, freshness: "Aging" },
  ],
  expectations: {
    minEvidence: 2,
    freshness: "Stale",
    requireFallback: false,
    allowOffer: true,
    requireAbstention: false,
    requirePolicyBlock: false,
  },
  tags: ["gas-pressure", "case-009", "ethereum-mainnet"],
};

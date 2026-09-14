import type { ExtendedScenarioCase } from "../types";

export const demoCase135: ExtendedScenarioCase = {
  id: "extended-135",
  label: "Extended mock case 135 — long continuity",
  kind: "gas-pressure",
  description: "Deterministic demo scenario for long continuity; no live-chain assertion is made.",
  walletSeed: "extended-wallet-135",
  transactionSeed: "extended-tx-135",
  chain: "Ethereum Mainnet",
  facts: [
      { ageDays: 185, eventType: "REPAYMENT", amount: 2995, sourceBlockOffset: 1350, verificationOffset: 1, freshness: "Stale" },
      { ageDays: 192, eventType: "COLLATERAL_DEPOSIT", amount: 3306, sourceBlockOffset: 1363, verificationOffset: 2, freshness: "Stale" },
      { ageDays: 199, eventType: "REPAYMENT", amount: 3617, sourceBlockOffset: 1376, verificationOffset: 3, freshness: "Stale" },
      { ageDays: 206, eventType: "REPAYMENT", amount: 3928, sourceBlockOffset: 1389, verificationOffset: 4, freshness: "Stale" },
  ],
  expectations: {
    minEvidence: 4,
    freshness: "Stale",
    requireFallback: false,
    allowOffer: true,
    requireAbstention: false,
    requirePolicyBlock: false,
  },
  tags: ["gas-pressure", "case-135", "ethereum-mainnet"],
};

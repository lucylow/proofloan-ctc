import type { ExtendedScenarioCase } from "../types";

export const demoCase065: ExtendedScenarioCase = {
  id: "extended-065",
  label: "Extended mock case 065 — long continuity",
  kind: "gas-pressure",
  description: "Deterministic demo scenario for long continuity; no live-chain assertion is made.",
  walletSeed: "extended-wallet-065",
  transactionSeed: "extended-tx-065",
  chain: "Ethereum Mainnet",
  facts: [
      { ageDays: 195, eventType: "REPAYMENT", amount: 1405, sourceBlockOffset: 650, verificationOffset: 1, freshness: "Stale" },
      { ageDays: 202, eventType: "COLLATERAL_DEPOSIT", amount: 1716, sourceBlockOffset: 663, verificationOffset: 2, freshness: "Stale" },
  ],
  expectations: {
    minEvidence: 2,
    freshness: "Stale",
    requireFallback: false,
    allowOffer: true,
    requireAbstention: false,
    requirePolicyBlock: false,
  },
  tags: ["gas-pressure", "case-065", "ethereum-mainnet"],
};

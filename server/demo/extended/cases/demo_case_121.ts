import type { ExtendedScenarioCase } from "../types";

export const demoCase121: ExtendedScenarioCase = {
  id: "extended-121",
  label: "Extended mock case 121 — long continuity",
  kind: "gas-pressure",
  description: "Deterministic demo scenario for long continuity; no live-chain assertion is made.",
  walletSeed: "extended-wallet-121",
  transactionSeed: "extended-tx-121",
  chain: "Ethereum Mainnet",
  facts: [
      { ageDays: 143, eventType: "REPAYMENT", amount: 1077, sourceBlockOffset: 1210, verificationOffset: 1, freshness: "Stale" },
      { ageDays: 150, eventType: "COLLATERAL_DEPOSIT", amount: 1388, sourceBlockOffset: 1223, verificationOffset: 2, freshness: "Stale" },
  ],
  expectations: {
    minEvidence: 2,
    freshness: "Stale",
    requireFallback: false,
    allowOffer: true,
    requireAbstention: false,
    requirePolicyBlock: false,
  },
  tags: ["gas-pressure", "case-121", "ethereum-mainnet"],
};

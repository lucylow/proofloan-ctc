import type { ExtendedScenarioCase } from "../types";

export const demoCase066: ExtendedScenarioCase = {
  id: "extended-066",
  label: "Extended mock case 066 — dense transaction block",
  kind: "merkle-pressure",
  description: "Deterministic demo scenario for dense transaction block; no live-chain assertion is made.",
  walletSeed: "extended-wallet-066",
  transactionSeed: "extended-tx-066",
  chain: "Ethereum Mainnet",
  facts: [
      { ageDays: 198, eventType: "REPAYMENT", amount: 1542, sourceBlockOffset: 660, verificationOffset: 1, freshness: "Stale" },
      { ageDays: 205, eventType: "COLLATERAL_DEPOSIT", amount: 1853, sourceBlockOffset: 673, verificationOffset: 2, freshness: "Stale" },
      { ageDays: 212, eventType: "REPAYMENT", amount: 2164, sourceBlockOffset: 686, verificationOffset: 3, freshness: "Stale" },
  ],
  expectations: {
    minEvidence: 3,
    freshness: undefined,
    requireFallback: false,
    allowOffer: true,
    requireAbstention: false,
    requirePolicyBlock: false,
  },
  tags: ["merkle-pressure", "case-066", "ethereum-mainnet"],
};

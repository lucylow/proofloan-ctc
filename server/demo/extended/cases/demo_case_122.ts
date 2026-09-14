import type { ExtendedScenarioCase } from "../types";

export const demoCase122: ExtendedScenarioCase = {
  id: "extended-122",
  label: "Extended mock case 122 — dense transaction block",
  kind: "merkle-pressure",
  description: "Deterministic demo scenario for dense transaction block; no live-chain assertion is made.",
  walletSeed: "extended-wallet-122",
  transactionSeed: "extended-tx-122",
  chain: "Ethereum Mainnet",
  facts: [
      { ageDays: 146, eventType: "REPAYMENT", amount: 1214, sourceBlockOffset: 1220, verificationOffset: 1, freshness: "Stale" },
      { ageDays: 153, eventType: "COLLATERAL_DEPOSIT", amount: 1525, sourceBlockOffset: 1233, verificationOffset: 2, freshness: "Stale" },
      { ageDays: 160, eventType: "REPAYMENT", amount: 1836, sourceBlockOffset: 1246, verificationOffset: 3, freshness: "Stale" },
  ],
  expectations: {
    minEvidence: 3,
    freshness: undefined,
    requireFallback: false,
    allowOffer: true,
    requireAbstention: false,
    requirePolicyBlock: false,
  },
  tags: ["merkle-pressure", "case-122", "ethereum-mainnet"],
};

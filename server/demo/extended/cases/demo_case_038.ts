import type { ExtendedScenarioCase } from "../types";

export const demoCase038: ExtendedScenarioCase = {
  id: "extended-038",
  label: "Extended mock case 038 — dense transaction block",
  kind: "merkle-pressure",
  description: "Deterministic demo scenario for dense transaction block; no live-chain assertion is made.",
  walletSeed: "extended-wallet-038",
  transactionSeed: "extended-tx-038",
  chain: "Ethereum Mainnet",
  facts: [
      { ageDays: 114, eventType: "REPAYMENT", amount: 5706, sourceBlockOffset: 380, verificationOffset: 1, freshness: "Stale" },
      { ageDays: 121, eventType: "COLLATERAL_DEPOSIT", amount: 6017, sourceBlockOffset: 393, verificationOffset: 2, freshness: "Stale" },
      { ageDays: 128, eventType: "REPAYMENT", amount: 6328, sourceBlockOffset: 406, verificationOffset: 3, freshness: "Stale" },
  ],
  expectations: {
    minEvidence: 3,
    freshness: undefined,
    requireFallback: false,
    allowOffer: true,
    requireAbstention: false,
    requirePolicyBlock: false,
  },
  tags: ["merkle-pressure", "case-038", "ethereum-mainnet"],
};

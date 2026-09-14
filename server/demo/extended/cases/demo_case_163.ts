import type { ExtendedScenarioCase } from "../types";

export const demoCase163: ExtendedScenarioCase = {
  id: "extended-163",
  label: "Extended mock case 163 — long continuity",
  kind: "gas-pressure",
  description: "Deterministic demo scenario for long continuity; no live-chain assertion is made.",
  walletSeed: "extended-wallet-163",
  transactionSeed: "extended-tx-163",
  chain: "Ethereum Mainnet",
  facts: [
      { ageDays: 49, eventType: "REPAYMENT", amount: 6831, sourceBlockOffset: 1630, verificationOffset: 1, freshness: "Aging" },
      { ageDays: 56, eventType: "COLLATERAL_DEPOSIT", amount: 7142, sourceBlockOffset: 1643, verificationOffset: 2, freshness: "Aging" },
      { ageDays: 63, eventType: "REPAYMENT", amount: 7453, sourceBlockOffset: 1656, verificationOffset: 3, freshness: "Aging" },
      { ageDays: 70, eventType: "REPAYMENT", amount: 7764, sourceBlockOffset: 1669, verificationOffset: 4, freshness: "Aging" },
  ],
  expectations: {
    minEvidence: 4,
    freshness: "Stale",
    requireFallback: false,
    allowOffer: true,
    requireAbstention: false,
    requirePolicyBlock: false,
  },
  tags: ["gas-pressure", "case-163", "ethereum-mainnet"],
};

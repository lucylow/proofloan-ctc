import type { ExtendedScenarioCase } from "../types";

export const demoCase051: ExtendedScenarioCase = {
  id: "extended-051",
  label: "Extended mock case 051 — long continuity",
  kind: "gas-pressure",
  description: "Deterministic demo scenario for long continuity; no live-chain assertion is made.",
  walletSeed: "extended-wallet-051",
  transactionSeed: "extended-tx-051",
  chain: "Ethereum Mainnet",
  facts: [
      { ageDays: 153, eventType: "REPAYMENT", amount: 7487, sourceBlockOffset: 510, verificationOffset: 1, freshness: "Stale" },
      { ageDays: 160, eventType: "COLLATERAL_DEPOSIT", amount: 7798, sourceBlockOffset: 523, verificationOffset: 2, freshness: "Stale" },
      { ageDays: 167, eventType: "REPAYMENT", amount: 8109, sourceBlockOffset: 536, verificationOffset: 3, freshness: "Stale" },
      { ageDays: 174, eventType: "REPAYMENT", amount: 8420, sourceBlockOffset: 549, verificationOffset: 4, freshness: "Stale" },
  ],
  expectations: {
    minEvidence: 4,
    freshness: "Stale",
    requireFallback: false,
    allowOffer: true,
    requireAbstention: false,
    requirePolicyBlock: false,
  },
  tags: ["gas-pressure", "case-051", "ethereum-mainnet"],
};

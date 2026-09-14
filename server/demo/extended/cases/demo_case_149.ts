import type { ExtendedScenarioCase } from "../types";

export const demoCase149: ExtendedScenarioCase = {
  id: "extended-149",
  label: "Extended mock case 149 — long continuity",
  kind: "gas-pressure",
  description: "Deterministic demo scenario for long continuity; no live-chain assertion is made.",
  walletSeed: "extended-wallet-149",
  transactionSeed: "extended-tx-149",
  chain: "Ethereum Mainnet",
  facts: [
      { ageDays: 7, eventType: "REPAYMENT", amount: 4913, sourceBlockOffset: 1490, verificationOffset: 1, freshness: "Fresh" },
      { ageDays: 14, eventType: "COLLATERAL_DEPOSIT", amount: 5224, sourceBlockOffset: 1503, verificationOffset: 2, freshness: "Aging" },
  ],
  expectations: {
    minEvidence: 2,
    freshness: "Stale",
    requireFallback: false,
    allowOffer: true,
    requireAbstention: false,
    requirePolicyBlock: false,
  },
  tags: ["gas-pressure", "case-149", "ethereum-mainnet"],
};

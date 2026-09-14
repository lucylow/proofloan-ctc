import type { ExtendedScenarioCase } from "../types";

export const demoCase023: ExtendedScenarioCase = {
  id: "extended-023",
  label: "Extended mock case 023 — long continuity",
  kind: "gas-pressure",
  description: "Deterministic demo scenario for long continuity; no live-chain assertion is made.",
  walletSeed: "extended-wallet-023",
  transactionSeed: "extended-tx-023",
  chain: "Ethereum Mainnet",
  facts: [
      { ageDays: 69, eventType: "REPAYMENT", amount: 3651, sourceBlockOffset: 230, verificationOffset: 1, freshness: "Aging" },
      { ageDays: 76, eventType: "COLLATERAL_DEPOSIT", amount: 3962, sourceBlockOffset: 243, verificationOffset: 2, freshness: "Aging" },
      { ageDays: 83, eventType: "REPAYMENT", amount: 4273, sourceBlockOffset: 256, verificationOffset: 3, freshness: "Aging" },
      { ageDays: 90, eventType: "REPAYMENT", amount: 4584, sourceBlockOffset: 269, verificationOffset: 4, freshness: "Aging" },
  ],
  expectations: {
    minEvidence: 4,
    freshness: "Stale",
    requireFallback: false,
    allowOffer: true,
    requireAbstention: false,
    requirePolicyBlock: false,
  },
  tags: ["gas-pressure", "case-023", "ethereum-mainnet"],
};

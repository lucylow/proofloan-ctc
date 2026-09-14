import type { ExtendedScenarioCase } from "../types";

export const demoCase054: ExtendedScenarioCase = {
  id: "extended-054",
  label: "Extended mock case 054 — policy rejection",
  kind: "riskguard-block",
  description: "Deterministic demo scenario for policy rejection; no live-chain assertion is made.",
  walletSeed: "extended-wallet-054",
  transactionSeed: "extended-tx-054",
  chain: "Ethereum Mainnet",
  facts: [
      { ageDays: 162, eventType: "LATE_PAYMENT", amount: 2632, sourceBlockOffset: 540, verificationOffset: 1, freshness: "Stale" },
      { ageDays: 169, eventType: "COLLATERAL_DEPOSIT", amount: 2736, sourceBlockOffset: 553, verificationOffset: 2, freshness: "Stale" },
      { ageDays: 176, eventType: "REPAYMENT", amount: 700, sourceBlockOffset: 566, verificationOffset: 3, freshness: "Stale" },
  ],
  expectations: {
    minEvidence: 3,
    freshness: undefined,
    requireFallback: false,
    allowOffer: false,
    requireAbstention: false,
    requirePolicyBlock: true,
  },
  tags: ["riskguard-block", "case-054", "ethereum-mainnet"],
};

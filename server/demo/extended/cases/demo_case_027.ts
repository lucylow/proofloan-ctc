import type { ExtendedScenarioCase } from "../types";

export const demoCase027: ExtendedScenarioCase = {
  id: "extended-027",
  label: "Extended mock case 027 — operator recovery",
  kind: "operator-recovery",
  description: "Deterministic demo scenario for operator recovery; no live-chain assertion is made.",
  walletSeed: "extended-wallet-027",
  transactionSeed: "extended-tx-027",
  chain: "Ethereum Mainnet",
  facts: [
      { ageDays: 81, eventType: "REPAYMENT", amount: 4199, sourceBlockOffset: 270, verificationOffset: 1, freshness: "Aging" },
      { ageDays: 88, eventType: "COLLATERAL_DEPOSIT", amount: 4510, sourceBlockOffset: 283, verificationOffset: 2, freshness: "Aging" },
      { ageDays: 95, eventType: "REPAYMENT", amount: 4821, sourceBlockOffset: 296, verificationOffset: 3, freshness: "Stale" },
      { ageDays: 102, eventType: "REPAYMENT", amount: 5132, sourceBlockOffset: 309, verificationOffset: 4, freshness: "Stale" },
  ],
    failure: { kind: "attestor", message: "Operator recovering after restart", retryAfterMs: 2000 },
  expectations: {
    minEvidence: 4,
    freshness: undefined,
    requireFallback: true,
    allowOffer: true,
    requireAbstention: false,
    requirePolicyBlock: false,
  },
  tags: ["operator-recovery", "case-027", "ethereum-mainnet"],
};

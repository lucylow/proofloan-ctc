import type { ExtendedScenarioCase } from "../types";

export const demoCase167: ExtendedScenarioCase = {
  id: "extended-167",
  label: "Extended mock case 167 — operator recovery",
  kind: "operator-recovery",
  description: "Deterministic demo scenario for operator recovery; no live-chain assertion is made.",
  walletSeed: "extended-wallet-167",
  transactionSeed: "extended-tx-167",
  chain: "Ethereum Mainnet",
  facts: [
      { ageDays: 61, eventType: "REPAYMENT", amount: 7379, sourceBlockOffset: 1670, verificationOffset: 1, freshness: "Aging" },
      { ageDays: 68, eventType: "COLLATERAL_DEPOSIT", amount: 7690, sourceBlockOffset: 1683, verificationOffset: 2, freshness: "Aging" },
      { ageDays: 75, eventType: "REPAYMENT", amount: 8001, sourceBlockOffset: 1696, verificationOffset: 3, freshness: "Aging" },
      { ageDays: 82, eventType: "REPAYMENT", amount: 8312, sourceBlockOffset: 1709, verificationOffset: 4, freshness: "Aging" },
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
  tags: ["operator-recovery", "case-167", "ethereum-mainnet"],
};

import type { ExtendedScenarioCase } from "../types";

export const demoCase139: ExtendedScenarioCase = {
  id: "extended-139",
  label: "Extended mock case 139 — operator recovery",
  kind: "operator-recovery",
  description: "Deterministic demo scenario for operator recovery; no live-chain assertion is made.",
  walletSeed: "extended-wallet-139",
  transactionSeed: "extended-tx-139",
  chain: "Ethereum Mainnet",
  facts: [
      { ageDays: 197, eventType: "REPAYMENT", amount: 3543, sourceBlockOffset: 1390, verificationOffset: 1, freshness: "Stale" },
      { ageDays: 204, eventType: "COLLATERAL_DEPOSIT", amount: 3854, sourceBlockOffset: 1403, verificationOffset: 2, freshness: "Stale" },
      { ageDays: 211, eventType: "REPAYMENT", amount: 4165, sourceBlockOffset: 1416, verificationOffset: 3, freshness: "Stale" },
      { ageDays: 218, eventType: "REPAYMENT", amount: 4476, sourceBlockOffset: 1429, verificationOffset: 4, freshness: "Stale" },
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
  tags: ["operator-recovery", "case-139", "ethereum-mainnet"],
};

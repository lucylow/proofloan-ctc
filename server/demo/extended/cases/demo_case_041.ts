import type { ExtendedScenarioCase } from "../types";

export const demoCase041: ExtendedScenarioCase = {
  id: "extended-041",
  label: "Extended mock case 041 — operator recovery",
  kind: "operator-recovery",
  description: "Deterministic demo scenario for operator recovery; no live-chain assertion is made.",
  walletSeed: "extended-wallet-041",
  transactionSeed: "extended-tx-041",
  chain: "Ethereum Mainnet",
  facts: [
      { ageDays: 123, eventType: "REPAYMENT", amount: 6117, sourceBlockOffset: 410, verificationOffset: 1, freshness: "Stale" },
      { ageDays: 130, eventType: "COLLATERAL_DEPOSIT", amount: 6428, sourceBlockOffset: 423, verificationOffset: 2, freshness: "Stale" },
  ],
    failure: { kind: "attestor", message: "Operator recovering after restart", retryAfterMs: 2000 },
  expectations: {
    minEvidence: 2,
    freshness: undefined,
    requireFallback: true,
    allowOffer: true,
    requireAbstention: false,
    requirePolicyBlock: false,
  },
  tags: ["operator-recovery", "case-041", "ethereum-mainnet"],
};

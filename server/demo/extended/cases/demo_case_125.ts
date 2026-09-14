import type { ExtendedScenarioCase } from "../types";

export const demoCase125: ExtendedScenarioCase = {
  id: "extended-125",
  label: "Extended mock case 125 — operator recovery",
  kind: "operator-recovery",
  description: "Deterministic demo scenario for operator recovery; no live-chain assertion is made.",
  walletSeed: "extended-wallet-125",
  transactionSeed: "extended-tx-125",
  chain: "Ethereum Mainnet",
  facts: [
      { ageDays: 155, eventType: "REPAYMENT", amount: 1625, sourceBlockOffset: 1250, verificationOffset: 1, freshness: "Stale" },
      { ageDays: 162, eventType: "COLLATERAL_DEPOSIT", amount: 1936, sourceBlockOffset: 1263, verificationOffset: 2, freshness: "Stale" },
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
  tags: ["operator-recovery", "case-125", "ethereum-mainnet"],
};

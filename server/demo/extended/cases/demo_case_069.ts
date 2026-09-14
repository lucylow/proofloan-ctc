import type { ExtendedScenarioCase } from "../types";

export const demoCase069: ExtendedScenarioCase = {
  id: "extended-069",
  label: "Extended mock case 069 — operator recovery",
  kind: "operator-recovery",
  description: "Deterministic demo scenario for operator recovery; no live-chain assertion is made.",
  walletSeed: "extended-wallet-069",
  transactionSeed: "extended-tx-069",
  chain: "Ethereum Mainnet",
  facts: [
      { ageDays: 207, eventType: "REPAYMENT", amount: 1953, sourceBlockOffset: 690, verificationOffset: 1, freshness: "Stale" },
      { ageDays: 214, eventType: "COLLATERAL_DEPOSIT", amount: 2264, sourceBlockOffset: 703, verificationOffset: 2, freshness: "Stale" },
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
  tags: ["operator-recovery", "case-069", "ethereum-mainnet"],
};

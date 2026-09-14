import type { ExtendedScenarioCase } from "../types";

export const demoCase013: ExtendedScenarioCase = {
  id: "extended-013",
  label: "Extended mock case 013 — operator recovery",
  kind: "operator-recovery",
  description: "Deterministic demo scenario for operator recovery; no live-chain assertion is made.",
  walletSeed: "extended-wallet-013",
  transactionSeed: "extended-tx-013",
  chain: "Ethereum Mainnet",
  facts: [
      { ageDays: 39, eventType: "REPAYMENT", amount: 2281, sourceBlockOffset: 130, verificationOffset: 1, freshness: "Aging" },
      { ageDays: 46, eventType: "COLLATERAL_DEPOSIT", amount: 2592, sourceBlockOffset: 143, verificationOffset: 2, freshness: "Aging" },
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
  tags: ["operator-recovery", "case-013", "ethereum-mainnet"],
};

import type { ExtendedScenarioCase } from "../types";

export const demoCase153: ExtendedScenarioCase = {
  id: "extended-153",
  label: "Extended mock case 153 — operator recovery",
  kind: "operator-recovery",
  description: "Deterministic demo scenario for operator recovery; no live-chain assertion is made.",
  walletSeed: "extended-wallet-153",
  transactionSeed: "extended-tx-153",
  chain: "Ethereum Mainnet",
  facts: [
      { ageDays: 19, eventType: "REPAYMENT", amount: 5461, sourceBlockOffset: 1530, verificationOffset: 1, freshness: "Aging" },
      { ageDays: 26, eventType: "COLLATERAL_DEPOSIT", amount: 5772, sourceBlockOffset: 1543, verificationOffset: 2, freshness: "Aging" },
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
  tags: ["operator-recovery", "case-153", "ethereum-mainnet"],
};

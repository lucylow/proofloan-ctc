import type { ExtendedScenarioCase } from "../types";

export const demoCase097: ExtendedScenarioCase = {
  id: "extended-097",
  label: "Extended mock case 097 — operator recovery",
  kind: "operator-recovery",
  description: "Deterministic demo scenario for operator recovery; no live-chain assertion is made.",
  walletSeed: "extended-wallet-097",
  transactionSeed: "extended-tx-097",
  chain: "Ethereum Mainnet",
  facts: [
      { ageDays: 71, eventType: "REPAYMENT", amount: 5789, sourceBlockOffset: 970, verificationOffset: 1, freshness: "Aging" },
      { ageDays: 78, eventType: "COLLATERAL_DEPOSIT", amount: 6100, sourceBlockOffset: 983, verificationOffset: 2, freshness: "Aging" },
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
  tags: ["operator-recovery", "case-097", "ethereum-mainnet"],
};

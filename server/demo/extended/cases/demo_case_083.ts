import type { ExtendedScenarioCase } from "../types";

export const demoCase083: ExtendedScenarioCase = {
  id: "extended-083",
  label: "Extended mock case 083 — operator recovery",
  kind: "operator-recovery",
  description: "Deterministic demo scenario for operator recovery; no live-chain assertion is made.",
  walletSeed: "extended-wallet-083",
  transactionSeed: "extended-tx-083",
  chain: "Ethereum Mainnet",
  facts: [
      { ageDays: 29, eventType: "REPAYMENT", amount: 3871, sourceBlockOffset: 830, verificationOffset: 1, freshness: "Aging" },
      { ageDays: 36, eventType: "COLLATERAL_DEPOSIT", amount: 4182, sourceBlockOffset: 843, verificationOffset: 2, freshness: "Aging" },
      { ageDays: 43, eventType: "REPAYMENT", amount: 4493, sourceBlockOffset: 856, verificationOffset: 3, freshness: "Aging" },
      { ageDays: 50, eventType: "REPAYMENT", amount: 4804, sourceBlockOffset: 869, verificationOffset: 4, freshness: "Aging" },
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
  tags: ["operator-recovery", "case-083", "ethereum-mainnet"],
};

import type { ExtendedScenarioCase } from "../types";

export const demoCase169: ExtendedScenarioCase = {
  id: "extended-169",
  label: "Extended mock case 169 — stable repayment",
  kind: "happy-path",
  description: "Deterministic demo scenario for stable repayment; no live-chain assertion is made.",
  walletSeed: "extended-wallet-169",
  transactionSeed: "extended-tx-169",
  chain: "Ethereum Sepolia",
  facts: [
      { ageDays: 67, eventType: "REPAYMENT", amount: 7653, sourceBlockOffset: 1690, verificationOffset: 1, freshness: "Aging" },
      { ageDays: 74, eventType: "COLLATERAL_DEPOSIT", amount: 7964, sourceBlockOffset: 1703, verificationOffset: 2, freshness: "Aging" },
  ],
  expectations: {
    minEvidence: 2,
    freshness: undefined,
    requireFallback: false,
    allowOffer: true,
    requireAbstention: false,
    requirePolicyBlock: false,
  },
  tags: ["happy-path", "case-169", "ethereum-sepolia"],
};

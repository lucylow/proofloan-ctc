import type { ExtendedScenarioCase } from "../types";

export const demoCase145: ExtendedScenarioCase = {
  id: "extended-145",
  label: "Extended mock case 145 — cross-chain history",
  kind: "cross-chain",
  description: "Deterministic demo scenario for cross-chain history; no live-chain assertion is made.",
  walletSeed: "extended-wallet-145",
  transactionSeed: "extended-tx-145",
  chain: "Ethereum Sepolia",
  facts: [
      { ageDays: 215, eventType: "REPAYMENT", amount: 4365, sourceBlockOffset: 1450, verificationOffset: 1, freshness: "Stale" },
      { ageDays: 2, eventType: "COLLATERAL_DEPOSIT", amount: 4676, sourceBlockOffset: 1463, verificationOffset: 2, freshness: "Fresh" },
  ],
  expectations: {
    minEvidence: 2,
    freshness: undefined,
    requireFallback: false,
    allowOffer: true,
    requireAbstention: false,
    requirePolicyBlock: false,
  },
  tags: ["cross-chain", "case-145", "ethereum-sepolia"],
};

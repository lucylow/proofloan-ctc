import type { ExtendedScenarioCase } from "../types";

export const demoCase067: ExtendedScenarioCase = {
  id: "extended-067",
  label: "Extended mock case 067 — model uncertainty",
  kind: "ai-abstain",
  description: "Deterministic demo scenario for model uncertainty; no live-chain assertion is made.",
  walletSeed: "extended-wallet-067",
  transactionSeed: "extended-tx-067",
  chain: "Ethereum Mainnet",
  facts: [
      { ageDays: 201, eventType: "REPAYMENT", amount: 1679, sourceBlockOffset: 670, verificationOffset: 1, freshness: "Stale" },
      { ageDays: 208, eventType: "COLLATERAL_DEPOSIT", amount: 1990, sourceBlockOffset: 683, verificationOffset: 2, freshness: "Stale" },
      { ageDays: 215, eventType: "REPAYMENT", amount: 2301, sourceBlockOffset: 696, verificationOffset: 3, freshness: "Stale" },
      { ageDays: 2, eventType: "REPAYMENT", amount: 2612, sourceBlockOffset: 709, verificationOffset: 4, freshness: "Fresh" },
  ],
  expectations: {
    minEvidence: 4,
    freshness: undefined,
    requireFallback: false,
    allowOffer: false,
    requireAbstention: true,
    requirePolicyBlock: false,
  },
  tags: ["ai-abstain", "case-067", "ethereum-mainnet"],
};

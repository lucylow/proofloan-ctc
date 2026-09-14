import type { ExtendedScenarioCase } from "../types";

export const demoCase137: ExtendedScenarioCase = {
  id: "extended-137",
  label: "Extended mock case 137 — model uncertainty",
  kind: "ai-abstain",
  description: "Deterministic demo scenario for model uncertainty; no live-chain assertion is made.",
  walletSeed: "extended-wallet-137",
  transactionSeed: "extended-tx-137",
  chain: "Ethereum Mainnet",
  facts: [
      { ageDays: 191, eventType: "REPAYMENT", amount: 3269, sourceBlockOffset: 1370, verificationOffset: 1, freshness: "Stale" },
      { ageDays: 198, eventType: "COLLATERAL_DEPOSIT", amount: 3580, sourceBlockOffset: 1383, verificationOffset: 2, freshness: "Stale" },
  ],
  expectations: {
    minEvidence: 2,
    freshness: undefined,
    requireFallback: false,
    allowOffer: false,
    requireAbstention: true,
    requirePolicyBlock: false,
  },
  tags: ["ai-abstain", "case-137", "ethereum-mainnet"],
};

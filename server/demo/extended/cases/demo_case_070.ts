import type { ExtendedScenarioCase } from "../types";

export const demoCase070: ExtendedScenarioCase = {
  id: "extended-070",
  label: "Extended mock case 070 — reorg recovery",
  kind: "reorg-recovery",
  description: "Deterministic demo scenario for reorg recovery; no live-chain assertion is made.",
  walletSeed: "extended-wallet-070",
  transactionSeed: "extended-tx-070",
  chain: "Ethereum Sepolia",
  facts: [
      { ageDays: 210, eventType: "REPAYMENT", amount: 2090, sourceBlockOffset: 700, verificationOffset: 1, freshness: "Stale" },
      { ageDays: 217, eventType: "COLLATERAL_DEPOSIT", amount: 2401, sourceBlockOffset: 713, verificationOffset: 2, freshness: "Stale" },
      { ageDays: 4, eventType: "REPAYMENT", amount: 2712, sourceBlockOffset: 726, verificationOffset: 3, freshness: "Fresh" },
  ],
    failure: { kind: "rpc", message: "Synthetic reorg detected", retryAfterMs: 4000 },
  expectations: {
    minEvidence: 3,
    freshness: undefined,
    requireFallback: true,
    allowOffer: true,
    requireAbstention: false,
    requirePolicyBlock: false,
  },
  tags: ["reorg-recovery", "case-070", "ethereum-sepolia"],
};

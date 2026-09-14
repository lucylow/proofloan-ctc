import type { ExtendedScenarioCase } from "../types";

export const demoCase126: ExtendedScenarioCase = {
  id: "extended-126",
  label: "Extended mock case 126 — reorg recovery",
  kind: "reorg-recovery",
  description: "Deterministic demo scenario for reorg recovery; no live-chain assertion is made.",
  walletSeed: "extended-wallet-126",
  transactionSeed: "extended-tx-126",
  chain: "Ethereum Sepolia",
  facts: [
      { ageDays: 158, eventType: "REPAYMENT", amount: 1762, sourceBlockOffset: 1260, verificationOffset: 1, freshness: "Stale" },
      { ageDays: 165, eventType: "COLLATERAL_DEPOSIT", amount: 2073, sourceBlockOffset: 1273, verificationOffset: 2, freshness: "Stale" },
      { ageDays: 172, eventType: "REPAYMENT", amount: 2384, sourceBlockOffset: 1286, verificationOffset: 3, freshness: "Stale" },
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
  tags: ["reorg-recovery", "case-126", "ethereum-sepolia"],
};

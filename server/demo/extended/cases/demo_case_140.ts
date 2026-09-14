import type { ExtendedScenarioCase } from "../types";

export const demoCase140: ExtendedScenarioCase = {
  id: "extended-140",
  label: "Extended mock case 140 — reorg recovery",
  kind: "reorg-recovery",
  description: "Deterministic demo scenario for reorg recovery; no live-chain assertion is made.",
  walletSeed: "extended-wallet-140",
  transactionSeed: "extended-tx-140",
  chain: "Ethereum Sepolia",
  facts: [
      { ageDays: 200, eventType: "REPAYMENT", amount: 3680, sourceBlockOffset: 1400, verificationOffset: 1, freshness: "Stale" },
  ],
    failure: { kind: "rpc", message: "Synthetic reorg detected", retryAfterMs: 4000 },
  expectations: {
    minEvidence: 1,
    freshness: undefined,
    requireFallback: true,
    allowOffer: true,
    requireAbstention: false,
    requirePolicyBlock: false,
  },
  tags: ["reorg-recovery", "case-140", "ethereum-sepolia"],
};

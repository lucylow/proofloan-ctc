import type { ExtendedScenarioCase } from "../types";

export const demoCase056: ExtendedScenarioCase = {
  id: "extended-056",
  label: "Extended mock case 056 — reorg recovery",
  kind: "reorg-recovery",
  description: "Deterministic demo scenario for reorg recovery; no live-chain assertion is made.",
  walletSeed: "extended-wallet-056",
  transactionSeed: "extended-tx-056",
  chain: "Ethereum Sepolia",
  facts: [
      { ageDays: 168, eventType: "REPAYMENT", amount: 8172, sourceBlockOffset: 560, verificationOffset: 1, freshness: "Stale" },
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
  tags: ["reorg-recovery", "case-056", "ethereum-sepolia"],
};

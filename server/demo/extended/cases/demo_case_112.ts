import type { ExtendedScenarioCase } from "../types";

export const demoCase112: ExtendedScenarioCase = {
  id: "extended-112",
  label: "Extended mock case 112 — reorg recovery",
  kind: "reorg-recovery",
  description: "Deterministic demo scenario for reorg recovery; no live-chain assertion is made.",
  walletSeed: "extended-wallet-112",
  transactionSeed: "extended-tx-112",
  chain: "Ethereum Sepolia",
  facts: [
      { ageDays: 116, eventType: "REPAYMENT", amount: 7844, sourceBlockOffset: 1120, verificationOffset: 1, freshness: "Stale" },
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
  tags: ["reorg-recovery", "case-112", "ethereum-sepolia"],
};

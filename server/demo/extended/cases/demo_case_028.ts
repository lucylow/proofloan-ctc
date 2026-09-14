import type { ExtendedScenarioCase } from "../types";

export const demoCase028: ExtendedScenarioCase = {
  id: "extended-028",
  label: "Extended mock case 028 — reorg recovery",
  kind: "reorg-recovery",
  description: "Deterministic demo scenario for reorg recovery; no live-chain assertion is made.",
  walletSeed: "extended-wallet-028",
  transactionSeed: "extended-tx-028",
  chain: "Ethereum Sepolia",
  facts: [
      { ageDays: 84, eventType: "REPAYMENT", amount: 4336, sourceBlockOffset: 280, verificationOffset: 1, freshness: "Aging" },
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
  tags: ["reorg-recovery", "case-028", "ethereum-sepolia"],
};

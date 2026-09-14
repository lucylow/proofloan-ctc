import type { ExtendedScenarioCase } from "../types";

export const demoCase168: ExtendedScenarioCase = {
  id: "extended-168",
  label: "Extended mock case 168 — reorg recovery",
  kind: "reorg-recovery",
  description: "Deterministic demo scenario for reorg recovery; no live-chain assertion is made.",
  walletSeed: "extended-wallet-168",
  transactionSeed: "extended-tx-168",
  chain: "Ethereum Sepolia",
  facts: [
      { ageDays: 64, eventType: "REPAYMENT", amount: 7516, sourceBlockOffset: 1680, verificationOffset: 1, freshness: "Aging" },
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
  tags: ["reorg-recovery", "case-168", "ethereum-sepolia"],
};

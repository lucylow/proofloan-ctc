import type { ExtendedScenarioCase } from "../types";

export const demoCase084: ExtendedScenarioCase = {
  id: "extended-084",
  label: "Extended mock case 084 — reorg recovery",
  kind: "reorg-recovery",
  description: "Deterministic demo scenario for reorg recovery; no live-chain assertion is made.",
  walletSeed: "extended-wallet-084",
  transactionSeed: "extended-tx-084",
  chain: "Ethereum Sepolia",
  facts: [
      { ageDays: 32, eventType: "REPAYMENT", amount: 4008, sourceBlockOffset: 840, verificationOffset: 1, freshness: "Aging" },
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
  tags: ["reorg-recovery", "case-084", "ethereum-sepolia"],
};

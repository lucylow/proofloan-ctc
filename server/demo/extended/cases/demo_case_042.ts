import type { ExtendedScenarioCase } from "../types";

export const demoCase042: ExtendedScenarioCase = {
  id: "extended-042",
  label: "Extended mock case 042 — reorg recovery",
  kind: "reorg-recovery",
  description: "Deterministic demo scenario for reorg recovery; no live-chain assertion is made.",
  walletSeed: "extended-wallet-042",
  transactionSeed: "extended-tx-042",
  chain: "Ethereum Sepolia",
  facts: [
      { ageDays: 126, eventType: "REPAYMENT", amount: 6254, sourceBlockOffset: 420, verificationOffset: 1, freshness: "Stale" },
      { ageDays: 133, eventType: "COLLATERAL_DEPOSIT", amount: 6565, sourceBlockOffset: 433, verificationOffset: 2, freshness: "Stale" },
      { ageDays: 140, eventType: "REPAYMENT", amount: 6876, sourceBlockOffset: 446, verificationOffset: 3, freshness: "Stale" },
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
  tags: ["reorg-recovery", "case-042", "ethereum-sepolia"],
};

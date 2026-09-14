import type { ExtendedScenarioCase } from "../types";

export const demoCase154: ExtendedScenarioCase = {
  id: "extended-154",
  label: "Extended mock case 154 — reorg recovery",
  kind: "reorg-recovery",
  description: "Deterministic demo scenario for reorg recovery; no live-chain assertion is made.",
  walletSeed: "extended-wallet-154",
  transactionSeed: "extended-tx-154",
  chain: "Ethereum Sepolia",
  facts: [
      { ageDays: 22, eventType: "REPAYMENT", amount: 5598, sourceBlockOffset: 1540, verificationOffset: 1, freshness: "Aging" },
      { ageDays: 29, eventType: "COLLATERAL_DEPOSIT", amount: 5909, sourceBlockOffset: 1553, verificationOffset: 2, freshness: "Aging" },
      { ageDays: 36, eventType: "REPAYMENT", amount: 6220, sourceBlockOffset: 1566, verificationOffset: 3, freshness: "Aging" },
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
  tags: ["reorg-recovery", "case-154", "ethereum-sepolia"],
};

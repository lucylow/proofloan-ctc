import type { ExtendedScenarioCase } from "../types";

export const demoCase049: ExtendedScenarioCase = {
  id: "extended-049",
  label: "Extended mock case 049 — rpc outage",
  kind: "rpc-failure",
  description: "Deterministic demo scenario for rpc outage; no live-chain assertion is made.",
  walletSeed: "extended-wallet-049",
  transactionSeed: "extended-tx-049",
  chain: "Ethereum Mainnet",
  facts: [
      { ageDays: 147, eventType: "REPAYMENT", amount: 7213, sourceBlockOffset: 490, verificationOffset: 1, freshness: "Stale" },
      { ageDays: 154, eventType: "COLLATERAL_DEPOSIT", amount: 7524, sourceBlockOffset: 503, verificationOffset: 2, freshness: "Stale" },
  ],
    failure: { kind: "rpc", message: "Synthetic RPC timeout", retryAfterMs: 3000 },
  expectations: {
    minEvidence: 2,
    freshness: undefined,
    requireFallback: true,
    allowOffer: true,
    requireAbstention: false,
    requirePolicyBlock: false,
  },
  tags: ["rpc-failure", "case-049", "ethereum-mainnet"],
};

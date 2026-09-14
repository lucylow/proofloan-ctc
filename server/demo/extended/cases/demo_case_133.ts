import type { ExtendedScenarioCase } from "../types";

export const demoCase133: ExtendedScenarioCase = {
  id: "extended-133",
  label: "Extended mock case 133 — rpc outage",
  kind: "rpc-failure",
  description: "Deterministic demo scenario for rpc outage; no live-chain assertion is made.",
  walletSeed: "extended-wallet-133",
  transactionSeed: "extended-tx-133",
  chain: "Ethereum Mainnet",
  facts: [
      { ageDays: 179, eventType: "REPAYMENT", amount: 2721, sourceBlockOffset: 1330, verificationOffset: 1, freshness: "Stale" },
      { ageDays: 186, eventType: "COLLATERAL_DEPOSIT", amount: 3032, sourceBlockOffset: 1343, verificationOffset: 2, freshness: "Stale" },
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
  tags: ["rpc-failure", "case-133", "ethereum-mainnet"],
};

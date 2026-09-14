import type { ExtendedScenarioCase } from "../types";

export const demoCase037: ExtendedScenarioCase = {
  id: "extended-037",
  label: "Extended mock case 037 — long continuity",
  kind: "gas-pressure",
  description: "Deterministic demo scenario for long continuity; no live-chain assertion is made.",
  walletSeed: "extended-wallet-037",
  transactionSeed: "extended-tx-037",
  chain: "Ethereum Mainnet",
  facts: [
      { ageDays: 111, eventType: "REPAYMENT", amount: 5569, sourceBlockOffset: 370, verificationOffset: 1, freshness: "Stale" },
      { ageDays: 118, eventType: "COLLATERAL_DEPOSIT", amount: 5880, sourceBlockOffset: 383, verificationOffset: 2, freshness: "Stale" },
  ],
  expectations: {
    minEvidence: 2,
    freshness: "Stale",
    requireFallback: false,
    allowOffer: true,
    requireAbstention: false,
    requirePolicyBlock: false,
  },
  tags: ["gas-pressure", "case-037", "ethereum-mainnet"],
};

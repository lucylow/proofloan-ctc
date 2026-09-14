import type { ExtendedScenarioCase } from "../types";

export const demoCase177: ExtendedScenarioCase = {
  id: "extended-177",
  label: "Extended mock case 177 — long continuity",
  kind: "gas-pressure",
  description: "Deterministic demo scenario for long continuity; no live-chain assertion is made.",
  walletSeed: "extended-wallet-177",
  transactionSeed: "extended-tx-177",
  chain: "Ethereum Mainnet",
  facts: [
      { ageDays: 91, eventType: "REPAYMENT", amount: 749, sourceBlockOffset: 1770, verificationOffset: 1, freshness: "Stale" },
      { ageDays: 98, eventType: "COLLATERAL_DEPOSIT", amount: 1060, sourceBlockOffset: 1783, verificationOffset: 2, freshness: "Stale" },
  ],
  expectations: {
    minEvidence: 2,
    freshness: "Stale",
    requireFallback: false,
    allowOffer: true,
    requireAbstention: false,
    requirePolicyBlock: false,
  },
  tags: ["gas-pressure", "case-177", "ethereum-mainnet"],
};

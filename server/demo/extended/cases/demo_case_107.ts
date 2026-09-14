import type { ExtendedScenarioCase } from "../types";

export const demoCase107: ExtendedScenarioCase = {
  id: "extended-107",
  label: "Extended mock case 107 — long continuity",
  kind: "gas-pressure",
  description: "Deterministic demo scenario for long continuity; no live-chain assertion is made.",
  walletSeed: "extended-wallet-107",
  transactionSeed: "extended-tx-107",
  chain: "Ethereum Mainnet",
  facts: [
      { ageDays: 101, eventType: "REPAYMENT", amount: 7159, sourceBlockOffset: 1070, verificationOffset: 1, freshness: "Stale" },
      { ageDays: 108, eventType: "COLLATERAL_DEPOSIT", amount: 7470, sourceBlockOffset: 1083, verificationOffset: 2, freshness: "Stale" },
      { ageDays: 115, eventType: "REPAYMENT", amount: 7781, sourceBlockOffset: 1096, verificationOffset: 3, freshness: "Stale" },
      { ageDays: 122, eventType: "REPAYMENT", amount: 8092, sourceBlockOffset: 1109, verificationOffset: 4, freshness: "Stale" },
  ],
  expectations: {
    minEvidence: 4,
    freshness: "Stale",
    requireFallback: false,
    allowOffer: true,
    requireAbstention: false,
    requirePolicyBlock: false,
  },
  tags: ["gas-pressure", "case-107", "ethereum-mainnet"],
};

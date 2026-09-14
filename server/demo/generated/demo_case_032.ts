import type { DemoProfileId } from "../types";

/** Generated regression/demo fixture #032.
 * Deterministic by design: the fixture never calls a network and is safe for presentations.
 */
export const DEMO_CASE_032 = {
  caseId: "CASE-032",
  profileId: "cross-chain-history" as DemoProfileId,
  walletSeed: "demo-wallet-032",
  transactionSeed: "demo-tx-032",
  sequence: 32,
  tags: ["demo", "offline", "deterministic", "regression"],
  expectations: {
    shouldGenerateFacts: true,
    shouldRemainClearlySynthetic: true,
    shouldNeverClaimLiveProof: true,
  },
} as const;

export type DemoCase_032 = typeof DEMO_CASE_032;

export function assertDemoCase_032(): true {
  if (!DEMO_CASE_032.expectations.shouldRemainClearlySynthetic) throw new Error("Synthetic fixture lost its demo guard.");
  if (!DEMO_CASE_032.expectations.shouldNeverClaimLiveProof) throw new Error("Synthetic fixture is unsafe for live claims.");
  return true;
}

import type { DemoProfileId } from "../types";

/** Generated regression/demo fixture #120.
 * Deterministic by design: the fixture never calls a network and is safe for presentations.
 */
export const DEMO_CASE_120 = {
  caseId: "CASE-120",
  profileId: "cross-chain-history" as DemoProfileId,
  walletSeed: "demo-wallet-120",
  transactionSeed: "demo-tx-120",
  sequence: 120,
  tags: ["demo", "offline", "deterministic", "regression"],
  expectations: {
    shouldGenerateFacts: true,
    shouldRemainClearlySynthetic: true,
    shouldNeverClaimLiveProof: true,
  },
} as const;

export type DemoCase_120 = typeof DEMO_CASE_120;

export function assertDemoCase_120(): true {
  if (!DEMO_CASE_120.expectations.shouldRemainClearlySynthetic) throw new Error("Synthetic fixture lost its demo guard.");
  if (!DEMO_CASE_120.expectations.shouldNeverClaimLiveProof) throw new Error("Synthetic fixture is unsafe for live claims.");
  return true;
}

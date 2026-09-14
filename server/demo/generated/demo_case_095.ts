import type { DemoProfileId } from "../types";

/** Generated regression/demo fixture #095.
 * Deterministic by design: the fixture never calls a network and is safe for presentations.
 */
export const DEMO_CASE_095 = {
  caseId: "CASE-095",
  profileId: "stale-evidence" as DemoProfileId,
  walletSeed: "demo-wallet-095",
  transactionSeed: "demo-tx-095",
  sequence: 95,
  tags: ["demo", "offline", "deterministic", "regression"],
  expectations: {
    shouldGenerateFacts: true,
    shouldRemainClearlySynthetic: true,
    shouldNeverClaimLiveProof: true,
  },
} as const;

export type DemoCase_095 = typeof DEMO_CASE_095;

export function assertDemoCase_095(): true {
  if (!DEMO_CASE_095.expectations.shouldRemainClearlySynthetic) throw new Error("Synthetic fixture lost its demo guard.");
  if (!DEMO_CASE_095.expectations.shouldNeverClaimLiveProof) throw new Error("Synthetic fixture is unsafe for live claims.");
  return true;
}

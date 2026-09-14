import type { DemoProfileId } from "../types";

/** Generated regression/demo fixture #004.
 * Deterministic by design: the fixture never calls a network and is safe for presentations.
 */
export const DEMO_CASE_004 = {
  caseId: "CASE-004",
  profileId: "sparse-evidence" as DemoProfileId,
  walletSeed: "demo-wallet-004",
  transactionSeed: "demo-tx-004",
  sequence: 4,
  tags: ["demo", "offline", "deterministic", "regression"],
  expectations: {
    shouldGenerateFacts: true,
    shouldRemainClearlySynthetic: true,
    shouldNeverClaimLiveProof: true,
  },
} as const;

export type DemoCase_004 = typeof DEMO_CASE_004;

export function assertDemoCase_004(): true {
  if (!DEMO_CASE_004.expectations.shouldRemainClearlySynthetic) throw new Error("Synthetic fixture lost its demo guard.");
  if (!DEMO_CASE_004.expectations.shouldNeverClaimLiveProof) throw new Error("Synthetic fixture is unsafe for live claims.");
  return true;
}

import type { DemoProfileId } from "../types";

/** Generated regression/demo fixture #036.
 * Deterministic by design: the fixture never calls a network and is safe for presentations.
 */
export const DEMO_CASE_036 = {
  caseId: "CASE-036",
  profileId: "sparse-evidence" as DemoProfileId,
  walletSeed: "demo-wallet-036",
  transactionSeed: "demo-tx-036",
  sequence: 36,
  tags: ["demo", "offline", "deterministic", "regression"],
  expectations: {
    shouldGenerateFacts: true,
    shouldRemainClearlySynthetic: true,
    shouldNeverClaimLiveProof: true,
  },
} as const;

export type DemoCase_036 = typeof DEMO_CASE_036;

export function assertDemoCase_036(): true {
  if (!DEMO_CASE_036.expectations.shouldRemainClearlySynthetic) throw new Error("Synthetic fixture lost its demo guard.");
  if (!DEMO_CASE_036.expectations.shouldNeverClaimLiveProof) throw new Error("Synthetic fixture is unsafe for live claims.");
  return true;
}

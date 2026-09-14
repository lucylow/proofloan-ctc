import type { DemoProfileId } from "../types";

/** Generated regression/demo fixture #055.
 * Deterministic by design: the fixture never calls a network and is safe for presentations.
 */
export const DEMO_CASE_055 = {
  caseId: "CASE-055",
  profileId: "stale-evidence" as DemoProfileId,
  walletSeed: "demo-wallet-055",
  transactionSeed: "demo-tx-055",
  sequence: 55,
  tags: ["demo", "offline", "deterministic", "regression"],
  expectations: {
    shouldGenerateFacts: true,
    shouldRemainClearlySynthetic: true,
    shouldNeverClaimLiveProof: true,
  },
} as const;

export type DemoCase_055 = typeof DEMO_CASE_055;

export function assertDemoCase_055(): true {
  if (!DEMO_CASE_055.expectations.shouldRemainClearlySynthetic) throw new Error("Synthetic fixture lost its demo guard.");
  if (!DEMO_CASE_055.expectations.shouldNeverClaimLiveProof) throw new Error("Synthetic fixture is unsafe for live claims.");
  return true;
}

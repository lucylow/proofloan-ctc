import type { DemoProfileId } from "../types";

/** Generated regression/demo fixture #023.
 * Deterministic by design: the fixture never calls a network and is safe for presentations.
 */
export const DEMO_CASE_023 = {
  caseId: "CASE-023",
  profileId: "stale-evidence" as DemoProfileId,
  walletSeed: "demo-wallet-023",
  transactionSeed: "demo-tx-023",
  sequence: 23,
  tags: ["demo", "offline", "deterministic", "regression"],
  expectations: {
    shouldGenerateFacts: true,
    shouldRemainClearlySynthetic: true,
    shouldNeverClaimLiveProof: true,
  },
} as const;

export type DemoCase_023 = typeof DEMO_CASE_023;

export function assertDemoCase_023(): true {
  if (!DEMO_CASE_023.expectations.shouldRemainClearlySynthetic) throw new Error("Synthetic fixture lost its demo guard.");
  if (!DEMO_CASE_023.expectations.shouldNeverClaimLiveProof) throw new Error("Synthetic fixture is unsafe for live claims.");
  return true;
}

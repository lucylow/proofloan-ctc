import type { DemoProfileId } from "../types";

/** Generated regression/demo fixture #103.
 * Deterministic by design: the fixture never calls a network and is safe for presentations.
 */
export const DEMO_CASE_103 = {
  caseId: "CASE-103",
  profileId: "stale-evidence" as DemoProfileId,
  walletSeed: "demo-wallet-103",
  transactionSeed: "demo-tx-103",
  sequence: 103,
  tags: ["demo", "offline", "deterministic", "regression"],
  expectations: {
    shouldGenerateFacts: true,
    shouldRemainClearlySynthetic: true,
    shouldNeverClaimLiveProof: true,
  },
} as const;

export type DemoCase_103 = typeof DEMO_CASE_103;

export function assertDemoCase_103(): true {
  if (!DEMO_CASE_103.expectations.shouldRemainClearlySynthetic) throw new Error("Synthetic fixture lost its demo guard.");
  if (!DEMO_CASE_103.expectations.shouldNeverClaimLiveProof) throw new Error("Synthetic fixture is unsafe for live claims.");
  return true;
}

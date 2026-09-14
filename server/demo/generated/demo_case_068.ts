import type { DemoProfileId } from "../types";

/** Generated regression/demo fixture #068.
 * Deterministic by design: the fixture never calls a network and is safe for presentations.
 */
export const DEMO_CASE_068 = {
  caseId: "CASE-068",
  profileId: "sparse-evidence" as DemoProfileId,
  walletSeed: "demo-wallet-068",
  transactionSeed: "demo-tx-068",
  sequence: 68,
  tags: ["demo", "offline", "deterministic", "regression"],
  expectations: {
    shouldGenerateFacts: true,
    shouldRemainClearlySynthetic: true,
    shouldNeverClaimLiveProof: true,
  },
} as const;

export type DemoCase_068 = typeof DEMO_CASE_068;

export function assertDemoCase_068(): true {
  if (!DEMO_CASE_068.expectations.shouldRemainClearlySynthetic) throw new Error("Synthetic fixture lost its demo guard.");
  if (!DEMO_CASE_068.expectations.shouldNeverClaimLiveProof) throw new Error("Synthetic fixture is unsafe for live claims.");
  return true;
}

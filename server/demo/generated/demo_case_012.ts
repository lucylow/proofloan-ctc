import type { DemoProfileId } from "../types";

/** Generated regression/demo fixture #012.
 * Deterministic by design: the fixture never calls a network and is safe for presentations.
 */
export const DEMO_CASE_012 = {
  caseId: "CASE-012",
  profileId: "sparse-evidence" as DemoProfileId,
  walletSeed: "demo-wallet-012",
  transactionSeed: "demo-tx-012",
  sequence: 12,
  tags: ["demo", "offline", "deterministic", "regression"],
  expectations: {
    shouldGenerateFacts: true,
    shouldRemainClearlySynthetic: true,
    shouldNeverClaimLiveProof: true,
  },
} as const;

export type DemoCase_012 = typeof DEMO_CASE_012;

export function assertDemoCase_012(): true {
  if (!DEMO_CASE_012.expectations.shouldRemainClearlySynthetic) throw new Error("Synthetic fixture lost its demo guard.");
  if (!DEMO_CASE_012.expectations.shouldNeverClaimLiveProof) throw new Error("Synthetic fixture is unsafe for live claims.");
  return true;
}

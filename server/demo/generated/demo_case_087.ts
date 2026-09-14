import type { DemoProfileId } from "../types";

/** Generated regression/demo fixture #087.
 * Deterministic by design: the fixture never calls a network and is safe for presentations.
 */
export const DEMO_CASE_087 = {
  caseId: "CASE-087",
  profileId: "stale-evidence" as DemoProfileId,
  walletSeed: "demo-wallet-087",
  transactionSeed: "demo-tx-087",
  sequence: 87,
  tags: ["demo", "offline", "deterministic", "regression"],
  expectations: {
    shouldGenerateFacts: true,
    shouldRemainClearlySynthetic: true,
    shouldNeverClaimLiveProof: true,
  },
} as const;

export type DemoCase_087 = typeof DEMO_CASE_087;

export function assertDemoCase_087(): true {
  if (!DEMO_CASE_087.expectations.shouldRemainClearlySynthetic) throw new Error("Synthetic fixture lost its demo guard.");
  if (!DEMO_CASE_087.expectations.shouldNeverClaimLiveProof) throw new Error("Synthetic fixture is unsafe for live claims.");
  return true;
}

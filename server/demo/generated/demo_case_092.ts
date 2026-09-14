import type { DemoProfileId } from "../types";

/** Generated regression/demo fixture #092.
 * Deterministic by design: the fixture never calls a network and is safe for presentations.
 */
export const DEMO_CASE_092 = {
  caseId: "CASE-092",
  profileId: "sparse-evidence" as DemoProfileId,
  walletSeed: "demo-wallet-092",
  transactionSeed: "demo-tx-092",
  sequence: 92,
  tags: ["demo", "offline", "deterministic", "regression"],
  expectations: {
    shouldGenerateFacts: true,
    shouldRemainClearlySynthetic: true,
    shouldNeverClaimLiveProof: true,
  },
} as const;

export type DemoCase_092 = typeof DEMO_CASE_092;

export function assertDemoCase_092(): true {
  if (!DEMO_CASE_092.expectations.shouldRemainClearlySynthetic) throw new Error("Synthetic fixture lost its demo guard.");
  if (!DEMO_CASE_092.expectations.shouldNeverClaimLiveProof) throw new Error("Synthetic fixture is unsafe for live claims.");
  return true;
}

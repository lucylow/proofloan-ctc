import type { DemoProfileId } from "../types";

/** Generated regression/demo fixture #079.
 * Deterministic by design: the fixture never calls a network and is safe for presentations.
 */
export const DEMO_CASE_079 = {
  caseId: "CASE-079",
  profileId: "stale-evidence" as DemoProfileId,
  walletSeed: "demo-wallet-079",
  transactionSeed: "demo-tx-079",
  sequence: 79,
  tags: ["demo", "offline", "deterministic", "regression"],
  expectations: {
    shouldGenerateFacts: true,
    shouldRemainClearlySynthetic: true,
    shouldNeverClaimLiveProof: true,
  },
} as const;

export type DemoCase_079 = typeof DEMO_CASE_079;

export function assertDemoCase_079(): true {
  if (!DEMO_CASE_079.expectations.shouldRemainClearlySynthetic) throw new Error("Synthetic fixture lost its demo guard.");
  if (!DEMO_CASE_079.expectations.shouldNeverClaimLiveProof) throw new Error("Synthetic fixture is unsafe for live claims.");
  return true;
}

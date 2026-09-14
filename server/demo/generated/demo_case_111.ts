import type { DemoProfileId } from "../types";

/** Generated regression/demo fixture #111.
 * Deterministic by design: the fixture never calls a network and is safe for presentations.
 */
export const DEMO_CASE_111 = {
  caseId: "CASE-111",
  profileId: "stale-evidence" as DemoProfileId,
  walletSeed: "demo-wallet-111",
  transactionSeed: "demo-tx-111",
  sequence: 111,
  tags: ["demo", "offline", "deterministic", "regression"],
  expectations: {
    shouldGenerateFacts: true,
    shouldRemainClearlySynthetic: true,
    shouldNeverClaimLiveProof: true,
  },
} as const;

export type DemoCase_111 = typeof DEMO_CASE_111;

export function assertDemoCase_111(): true {
  if (!DEMO_CASE_111.expectations.shouldRemainClearlySynthetic) throw new Error("Synthetic fixture lost its demo guard.");
  if (!DEMO_CASE_111.expectations.shouldNeverClaimLiveProof) throw new Error("Synthetic fixture is unsafe for live claims.");
  return true;
}

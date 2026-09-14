import type { DemoProfileId } from "../types";

/** Generated regression/demo fixture #071.
 * Deterministic by design: the fixture never calls a network and is safe for presentations.
 */
export const DEMO_CASE_071 = {
  caseId: "CASE-071",
  profileId: "stale-evidence" as DemoProfileId,
  walletSeed: "demo-wallet-071",
  transactionSeed: "demo-tx-071",
  sequence: 71,
  tags: ["demo", "offline", "deterministic", "regression"],
  expectations: {
    shouldGenerateFacts: true,
    shouldRemainClearlySynthetic: true,
    shouldNeverClaimLiveProof: true,
  },
} as const;

export type DemoCase_071 = typeof DEMO_CASE_071;

export function assertDemoCase_071(): true {
  if (!DEMO_CASE_071.expectations.shouldRemainClearlySynthetic) throw new Error("Synthetic fixture lost its demo guard.");
  if (!DEMO_CASE_071.expectations.shouldNeverClaimLiveProof) throw new Error("Synthetic fixture is unsafe for live claims.");
  return true;
}

import type { DemoProfileId } from "../types";

/** Generated regression/demo fixture #018.
 * Deterministic by design: the fixture never calls a network and is safe for presentations.
 */
export const DEMO_CASE_018 = {
  caseId: "CASE-018",
  profileId: "balanced-borrower" as DemoProfileId,
  walletSeed: "demo-wallet-018",
  transactionSeed: "demo-tx-018",
  sequence: 18,
  tags: ["demo", "offline", "deterministic", "regression"],
  expectations: {
    shouldGenerateFacts: true,
    shouldRemainClearlySynthetic: true,
    shouldNeverClaimLiveProof: true,
  },
} as const;

export type DemoCase_018 = typeof DEMO_CASE_018;

export function assertDemoCase_018(): true {
  if (!DEMO_CASE_018.expectations.shouldRemainClearlySynthetic) throw new Error("Synthetic fixture lost its demo guard.");
  if (!DEMO_CASE_018.expectations.shouldNeverClaimLiveProof) throw new Error("Synthetic fixture is unsafe for live claims.");
  return true;
}

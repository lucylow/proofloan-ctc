import type { DemoProfileId } from "../types";

/** Generated regression/demo fixture #082.
 * Deterministic by design: the fixture never calls a network and is safe for presentations.
 */
export const DEMO_CASE_082 = {
  caseId: "CASE-082",
  profileId: "balanced-borrower" as DemoProfileId,
  walletSeed: "demo-wallet-082",
  transactionSeed: "demo-tx-082",
  sequence: 82,
  tags: ["demo", "offline", "deterministic", "regression"],
  expectations: {
    shouldGenerateFacts: true,
    shouldRemainClearlySynthetic: true,
    shouldNeverClaimLiveProof: true,
  },
} as const;

export type DemoCase_082 = typeof DEMO_CASE_082;

export function assertDemoCase_082(): true {
  if (!DEMO_CASE_082.expectations.shouldRemainClearlySynthetic) throw new Error("Synthetic fixture lost its demo guard.");
  if (!DEMO_CASE_082.expectations.shouldNeverClaimLiveProof) throw new Error("Synthetic fixture is unsafe for live claims.");
  return true;
}

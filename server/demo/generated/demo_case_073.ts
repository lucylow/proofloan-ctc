import type { DemoProfileId } from "../types";

/** Generated regression/demo fixture #073.
 * Deterministic by design: the fixture never calls a network and is safe for presentations.
 */
export const DEMO_CASE_073 = {
  caseId: "CASE-073",
  profileId: "strong-borrower" as DemoProfileId,
  walletSeed: "demo-wallet-073",
  transactionSeed: "demo-tx-073",
  sequence: 73,
  tags: ["demo", "offline", "deterministic", "regression"],
  expectations: {
    shouldGenerateFacts: true,
    shouldRemainClearlySynthetic: true,
    shouldNeverClaimLiveProof: true,
  },
} as const;

export type DemoCase_073 = typeof DEMO_CASE_073;

export function assertDemoCase_073(): true {
  if (!DEMO_CASE_073.expectations.shouldRemainClearlySynthetic) throw new Error("Synthetic fixture lost its demo guard.");
  if (!DEMO_CASE_073.expectations.shouldNeverClaimLiveProof) throw new Error("Synthetic fixture is unsafe for live claims.");
  return true;
}

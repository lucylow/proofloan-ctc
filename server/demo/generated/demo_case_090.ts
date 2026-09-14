import type { DemoProfileId } from "../types";

/** Generated regression/demo fixture #090.
 * Deterministic by design: the fixture never calls a network and is safe for presentations.
 */
export const DEMO_CASE_090 = {
  caseId: "CASE-090",
  profileId: "balanced-borrower" as DemoProfileId,
  walletSeed: "demo-wallet-090",
  transactionSeed: "demo-tx-090",
  sequence: 90,
  tags: ["demo", "offline", "deterministic", "regression"],
  expectations: {
    shouldGenerateFacts: true,
    shouldRemainClearlySynthetic: true,
    shouldNeverClaimLiveProof: true,
  },
} as const;

export type DemoCase_090 = typeof DEMO_CASE_090;

export function assertDemoCase_090(): true {
  if (!DEMO_CASE_090.expectations.shouldRemainClearlySynthetic) throw new Error("Synthetic fixture lost its demo guard.");
  if (!DEMO_CASE_090.expectations.shouldNeverClaimLiveProof) throw new Error("Synthetic fixture is unsafe for live claims.");
  return true;
}

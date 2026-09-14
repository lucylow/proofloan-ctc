import type { DemoProfileId } from "../types";

/** Generated regression/demo fixture #062.
 * Deterministic by design: the fixture never calls a network and is safe for presentations.
 */
export const DEMO_CASE_062 = {
  caseId: "CASE-062",
  profileId: "late-payment" as DemoProfileId,
  walletSeed: "demo-wallet-062",
  transactionSeed: "demo-tx-062",
  sequence: 62,
  tags: ["demo", "offline", "deterministic", "regression"],
  expectations: {
    shouldGenerateFacts: true,
    shouldRemainClearlySynthetic: true,
    shouldNeverClaimLiveProof: true,
  },
} as const;

export type DemoCase_062 = typeof DEMO_CASE_062;

export function assertDemoCase_062(): true {
  if (!DEMO_CASE_062.expectations.shouldRemainClearlySynthetic) throw new Error("Synthetic fixture lost its demo guard.");
  if (!DEMO_CASE_062.expectations.shouldNeverClaimLiveProof) throw new Error("Synthetic fixture is unsafe for live claims.");
  return true;
}

import type { DemoProfileId } from "../types";

/** Generated regression/demo fixture #030.
 * Deterministic by design: the fixture never calls a network and is safe for presentations.
 */
export const DEMO_CASE_030 = {
  caseId: "CASE-030",
  profileId: "late-payment" as DemoProfileId,
  walletSeed: "demo-wallet-030",
  transactionSeed: "demo-tx-030",
  sequence: 30,
  tags: ["demo", "offline", "deterministic", "regression"],
  expectations: {
    shouldGenerateFacts: true,
    shouldRemainClearlySynthetic: true,
    shouldNeverClaimLiveProof: true,
  },
} as const;

export type DemoCase_030 = typeof DEMO_CASE_030;

export function assertDemoCase_030(): true {
  if (!DEMO_CASE_030.expectations.shouldRemainClearlySynthetic) throw new Error("Synthetic fixture lost its demo guard.");
  if (!DEMO_CASE_030.expectations.shouldNeverClaimLiveProof) throw new Error("Synthetic fixture is unsafe for live claims.");
  return true;
}

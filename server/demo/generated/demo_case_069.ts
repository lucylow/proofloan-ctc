import type { DemoProfileId } from "../types";

/** Generated regression/demo fixture #069.
 * Deterministic by design: the fixture never calls a network and is safe for presentations.
 */
export const DEMO_CASE_069 = {
  caseId: "CASE-069",
  profileId: "fresh-repayment" as DemoProfileId,
  walletSeed: "demo-wallet-069",
  transactionSeed: "demo-tx-069",
  sequence: 69,
  tags: ["demo", "offline", "deterministic", "regression"],
  expectations: {
    shouldGenerateFacts: true,
    shouldRemainClearlySynthetic: true,
    shouldNeverClaimLiveProof: true,
  },
} as const;

export type DemoCase_069 = typeof DEMO_CASE_069;

export function assertDemoCase_069(): true {
  if (!DEMO_CASE_069.expectations.shouldRemainClearlySynthetic) throw new Error("Synthetic fixture lost its demo guard.");
  if (!DEMO_CASE_069.expectations.shouldNeverClaimLiveProof) throw new Error("Synthetic fixture is unsafe for live claims.");
  return true;
}

import type { DemoProfileId } from "../types";

/** Generated regression/demo fixture #117.
 * Deterministic by design: the fixture never calls a network and is safe for presentations.
 */
export const DEMO_CASE_117 = {
  caseId: "CASE-117",
  profileId: "fresh-repayment" as DemoProfileId,
  walletSeed: "demo-wallet-117",
  transactionSeed: "demo-tx-117",
  sequence: 117,
  tags: ["demo", "offline", "deterministic", "regression"],
  expectations: {
    shouldGenerateFacts: true,
    shouldRemainClearlySynthetic: true,
    shouldNeverClaimLiveProof: true,
  },
} as const;

export type DemoCase_117 = typeof DEMO_CASE_117;

export function assertDemoCase_117(): true {
  if (!DEMO_CASE_117.expectations.shouldRemainClearlySynthetic) throw new Error("Synthetic fixture lost its demo guard.");
  if (!DEMO_CASE_117.expectations.shouldNeverClaimLiveProof) throw new Error("Synthetic fixture is unsafe for live claims.");
  return true;
}

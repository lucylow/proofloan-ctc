import type { DemoProfileId } from "../types";

/** Generated regression/demo fixture #037.
 * Deterministic by design: the fixture never calls a network and is safe for presentations.
 */
export const DEMO_CASE_037 = {
  caseId: "CASE-037",
  profileId: "fresh-repayment" as DemoProfileId,
  walletSeed: "demo-wallet-037",
  transactionSeed: "demo-tx-037",
  sequence: 37,
  tags: ["demo", "offline", "deterministic", "regression"],
  expectations: {
    shouldGenerateFacts: true,
    shouldRemainClearlySynthetic: true,
    shouldNeverClaimLiveProof: true,
  },
} as const;

export type DemoCase_037 = typeof DEMO_CASE_037;

export function assertDemoCase_037(): true {
  if (!DEMO_CASE_037.expectations.shouldRemainClearlySynthetic) throw new Error("Synthetic fixture lost its demo guard.");
  if (!DEMO_CASE_037.expectations.shouldNeverClaimLiveProof) throw new Error("Synthetic fixture is unsafe for live claims.");
  return true;
}

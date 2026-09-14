import type { DemoProfileId } from "../types";

/** Generated regression/demo fixture #057.
 * Deterministic by design: the fixture never calls a network and is safe for presentations.
 */
export const DEMO_CASE_057 = {
  caseId: "CASE-057",
  profileId: "strong-borrower" as DemoProfileId,
  walletSeed: "demo-wallet-057",
  transactionSeed: "demo-tx-057",
  sequence: 57,
  tags: ["demo", "offline", "deterministic", "regression"],
  expectations: {
    shouldGenerateFacts: true,
    shouldRemainClearlySynthetic: true,
    shouldNeverClaimLiveProof: true,
  },
} as const;

export type DemoCase_057 = typeof DEMO_CASE_057;

export function assertDemoCase_057(): true {
  if (!DEMO_CASE_057.expectations.shouldRemainClearlySynthetic) throw new Error("Synthetic fixture lost its demo guard.");
  if (!DEMO_CASE_057.expectations.shouldNeverClaimLiveProof) throw new Error("Synthetic fixture is unsafe for live claims.");
  return true;
}

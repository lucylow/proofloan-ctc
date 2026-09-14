import { describe, expect, it } from "vitest";
import { getMobileErrorNoticeModel, isRetryableMobileError } from "./mobileErrorNotice";

describe("mobile error notice model", () => {
  it("strips the structured prefix while preserving the proof-worker code", () => {
    expect(getMobileErrorNoticeModel("[PROOFLOAN_PROOF_WORKER_ERROR] Source transaction is not mined yet.", true)).toEqual({
      code: "PROOFLOAN_PROOF_WORKER_ERROR",
      message: "Source transaction is not mined yet.",
      guidance: "Confirm the transaction is mined on the selected testnet, then retry verification.",
      actionLabel: "Retry verification",
      canRetry: true,
    });
  });

  it("maps validation failures to input review guidance", () => {
    expect(getMobileErrorNoticeModel("[PROOFLOAN_VALIDATION_ERROR] Enter a wallet address.")).toEqual({
      code: "PROOFLOAN_VALIDATION_ERROR",
      message: "Enter a wallet address.",
      guidance: "Check the source value and selected chain, then submit again.",
      actionLabel: "Review input",
      canRetry: false,
    });
  });

  it("maps rate-limited requests to retry guidance", () => {
    expect(getMobileErrorNoticeModel("[PROOFLOAN_RATE_LIMITED] Too many proof requests. Please retry shortly.", true)).toEqual({
      code: "PROOFLOAN_RATE_LIMITED",
      message: "Too many proof requests. Please retry shortly.",
      guidance: "Too many proof requests arrived in a short period. Wait briefly, then retry.",
      actionLabel: "Retry shortly",
      canRetry: true,
    });
  });

  it("uses a safe retry fallback for unclassified mobile failures", () => {
    expect(getMobileErrorNoticeModel("Clipboard access is unavailable on this device.", true)).toEqual({
      code: "UNCLASSIFIED_ERROR",
      message: "Clipboard access is unavailable on this device.",
      guidance: "Try again, and contact support if the problem continues.",
      actionLabel: "Try again",
      canRetry: true,
    });
  });

  it("only exposes retry when the caller provides a retry action", () => {
    expect(getMobileErrorNoticeModel("[PROOFLOAN_STATE_CONFLICT] Offer is already accepted.")).toEqual({
      code: "PROOFLOAN_STATE_CONFLICT",
      message: "Offer is already accepted.",
      guidance: "This action is no longer available because the offer state changed. Refresh status before trying another action.",
      actionLabel: "Refresh status",
      canRetry: false,
    });
    expect(getMobileErrorNoticeModel("[PROOFLOAN_DATABASE_ERROR] Read-back failed.", true).actionLabel).toBe("Refresh credit file");
    expect(getMobileErrorNoticeModel("[PROOFLOAN_POLICY_ERROR] Offer blocked.").guidance).toContain("contact support");
    expect(getMobileErrorNoticeModel("[PROOFLOAN_ATC_ERROR] [ATC:PAYMENT] Simulated ATC payment is missing sender or amount.", true)).toEqual({
      code: "PROOFLOAN_ATC_ERROR",
      message: "[ATC:PAYMENT] Simulated ATC payment is missing sender or amount.",
      guidance: "The ATC action fee could not be settled, so the offer was left unchanged. Retry acceptance with the same key, or review the payment adapter.",
      actionLabel: "Retry acceptance",
      canRetry: true,
    });
    expect(getMobileErrorNoticeModel("[PROOFLOAN_AI_ERROR] [AI:VALIDATION] Feature vector is invalid.", true)).toEqual({
      code: "PROOFLOAN_AI_ERROR",
      message: "[AI:VALIDATION] Feature vector is invalid.",
      guidance: "Advisory scoring could not complete from the verified evidence. Refresh the credit file or retry the proof request; RiskGuard will not issue an offer until scoring succeeds.",
      actionLabel: "Retry scoring",
      canRetry: true,
    });
    expect(getMobileErrorNoticeModel("[PROOFLOAN_READABILITY_ERROR] [READABILITY:EVENT_POLICY] Generic source event cannot trigger readability.", true)).toEqual({
      code: "PROOFLOAN_READABILITY_ERROR",
      message: "[READABILITY:EVENT_POLICY] Generic source event cannot trigger readability.",
      guidance: "Cross-chain readability could not complete. Confirm the source event, chain, and confirmations, then retry.",
      actionLabel: "Retry readability",
      canRetry: true,
    });
    expect(getMobileErrorNoticeModel("[PROOFLOAN_OPERATOR_ERROR] [OPERATOR:RPC] All cc3 RPC endpoints are unhealthy.", true).actionLabel).toBe("Review operator status");
    expect(getMobileErrorNoticeModel("[PROOFLOAN_DEMO_ERROR] [DEMO:DISABLED] ProofLoan demo mode is disabled.", true)).toEqual({
      code: "PROOFLOAN_DEMO_ERROR",
      message: "[DEMO:DISABLED] ProofLoan demo mode is disabled.",
      guidance: "This demo request used synthetic data only. Confirm demo mode is enabled and retry the labeled mock walkthrough; mock facts never become live proofs.",
      actionLabel: "Retry demo walkthrough",
      canRetry: true,
    });
    expect(getMobileErrorNoticeModel("[PROOFLOAN_AI_MOCK_ERROR] Unknown AI mock scenario: live-oracle", true)).toEqual({
      code: "PROOFLOAN_AI_MOCK_ERROR",
      message: "Unknown AI mock scenario: live-oracle",
      guidance: "This AI mock scenario is synthetic. Retry the labeled mock lab; mock interpretation never becomes live Attestcoin evidence or a RiskGuard bypass.",
      actionLabel: "Retry AI mock lab",
      canRetry: true,
    });
    expect(getMobileErrorNoticeModel("[PROOFLOAN_DAO_ERROR] [DAO:GUARDIAN] guardian required to cancel queued or executing proposals.", true)).toEqual({
      code: "PROOFLOAN_DAO_ERROR",
      message: "[DAO:GUARDIAN] guardian required to cancel queued or executing proposals.",
      guidance: "This governance action was rejected. Check proposal state, voting window, timelock, and guardian permissions, then retry the allowed step.",
      actionLabel: "Review governance",
      canRetry: true,
    });
    expect(getMobileErrorNoticeModel("[PROOFLOAN_PROVING_ERROR] [PROVING:QUERY] INVALID_TX_HASH", true)).toEqual({
      code: "PROOFLOAN_PROVING_ERROR",
      message: "[PROVING:QUERY] INVALID_TX_HASH",
      guidance: "Transaction proving could not complete. Confirm the chain key and 32-byte source hash, then retry the preview flow.",
      actionLabel: "Retry proving",
      canRetry: true,
    });
    expect(isRetryableMobileError(true)).toBe(true);
    expect(isRetryableMobileError(false)).toBe(false);
    expect(isRetryableMobileError(undefined)).toBe(false);
  });
});

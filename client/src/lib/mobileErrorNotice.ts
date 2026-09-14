import { cleanProofLoanErrorMessage, getProofLoanErrorCode, PROOFLOAN_ERROR_CODES, type ProofLoanErrorCode } from "@shared/proofloan";

export type MobileErrorNoticeModel = {
  code: string;
  message: string;
  guidance: string;
  actionLabel: string;
  canRetry: boolean;
};

const RECOVERY_BY_CODE: Record<ProofLoanErrorCode, { guidance: string; actionLabel: string }> = {
  [PROOFLOAN_ERROR_CODES.VALIDATION]: { guidance: "Check the source value and selected chain, then submit again.", actionLabel: "Review input" },
  [PROOFLOAN_ERROR_CODES.DATABASE]: { guidance: "Your evidence is unchanged. Refresh the credit file or try again shortly.", actionLabel: "Refresh credit file" },
  [PROOFLOAN_ERROR_CODES.PROOF_WORKER]: { guidance: "Confirm the transaction is mined on the selected testnet, then retry verification.", actionLabel: "Retry verification" },
  [PROOFLOAN_ERROR_CODES.POLICY]: { guidance: "RiskGuard blocked this offer. Review the decision details and contact support if you believe the policy result is incorrect.", actionLabel: "Review decision" },
  [PROOFLOAN_ERROR_CODES.STATE_CONFLICT]: { guidance: "This action is no longer available because the offer state changed. Refresh status before trying another action.", actionLabel: "Refresh status" },
  [PROOFLOAN_ERROR_CODES.RATE_LIMITED]: { guidance: "Too many proof requests arrived in a short period. Wait briefly, then retry.", actionLabel: "Retry shortly" },
  [PROOFLOAN_ERROR_CODES.ATC]: { guidance: "The ATC action fee could not be settled, so the offer was left unchanged. Retry acceptance with the same key, or review the payment adapter.", actionLabel: "Retry acceptance" },
  [PROOFLOAN_ERROR_CODES.AI]: { guidance: "Advisory scoring could not complete from the verified evidence. Refresh the credit file or retry the proof request; RiskGuard will not issue an offer until scoring succeeds.", actionLabel: "Retry scoring" },
  [PROOFLOAN_ERROR_CODES.READABILITY]: { guidance: "Cross-chain readability could not complete. Confirm the source event, chain, and confirmations, then retry.", actionLabel: "Retry readability" },
  [PROOFLOAN_ERROR_CODES.OPERATOR]: { guidance: "Attestor operator configuration or readiness is blocked. Review authorization, RPC, and account-separation checks before planning on-chain actions.", actionLabel: "Review operator status" },
  [PROOFLOAN_ERROR_CODES.DEMO]: { guidance: "This demo request used synthetic data only. Confirm demo mode is enabled and retry the labeled mock walkthrough; mock facts never become live proofs.", actionLabel: "Retry demo walkthrough" },
  [PROOFLOAN_ERROR_CODES.AI_MOCK]: { guidance: "This AI mock scenario is synthetic. Retry the labeled mock lab; mock interpretation never becomes live Attestcoin evidence or a RiskGuard bypass.", actionLabel: "Retry AI mock lab" },
  [PROOFLOAN_ERROR_CODES.DAO]: { guidance: "This governance action was rejected. Check proposal state, voting window, timelock, and guardian permissions, then retry the allowed step.", actionLabel: "Review governance" },
  [PROOFLOAN_ERROR_CODES.PROVING]: { guidance: "Transaction proving could not complete. Confirm the chain key and 32-byte source hash, then retry the preview flow.", actionLabel: "Retry proving" },
};

export function getMobileErrorNoticeModel(message: string, canRetry = false): MobileErrorNoticeModel {
  const code = getProofLoanErrorCode(message);
  const recovery = code ? RECOVERY_BY_CODE[code] : { guidance: "Try again, and contact support if the problem continues.", actionLabel: "Try again" };
  return {
    code: code ?? "UNCLASSIFIED_ERROR",
    message: cleanProofLoanErrorMessage(message),
    guidance: recovery.guidance,
    actionLabel: recovery.actionLabel,
    canRetry,
  };
}

export function isRetryableMobileError(canRetry: boolean | undefined): boolean {
  return canRetry === true;
}

import { ProofLoanAppError } from "./appError";

export function createWalletRejectedError(message = "User rejected wallet request") {
  return new ProofLoanAppError({
    code: "WALLET_REJECTED",
    message,
    source: "wallet",
    retryable: false,
  });
}

export function createWalletDisconnectedError(message = "Wallet disconnected") {
  return new ProofLoanAppError({
    code: "WALLET_DISCONNECTED",
    message,
    source: "wallet",
    retryable: true,
  });
}

export function isUserRejectedWalletError(error: unknown) {
  const message = error instanceof Error ? error.message.toLowerCase() : String(error ?? "").toLowerCase();
  return message.includes("4001") || message.includes("user rejected") || message.includes("rejected the request");
}

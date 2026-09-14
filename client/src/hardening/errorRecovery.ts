import type { NormalizedAppError } from "./types";

export function getRecommendedRecovery(error: NormalizedAppError): "retry" | "connect" | "switch-network" | "reload" | "navigate" | "none" {
  switch (error.code) {
    case "WALLET_MISSING":
    case "WALLET_REJECTED":
    case "WALLET_FAILED":
      return "connect";
    case "WRONG_NETWORK":
      return "switch-network";
    case "NETWORK_OFFLINE":
    case "NETWORK_TIMEOUT":
    case "NETWORK_FAILED":
      return "retry";
    case "ROUTE_INVALID":
      return "navigate";
    case "UNKNOWN_ERROR":
    case "DEMO_DATA_INVALID":
      return "reload";
    default:
      return error.retryable ? "retry" : "none";
  }
}

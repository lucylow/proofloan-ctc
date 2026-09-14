import type { ElectionMode, OperatorEnvironment, OperatorPolicy } from "./types";
import { ctcAmountToAtomic, getAttestorSettings } from "@shared/attestorSettings";
import { parseAtomicBalance } from "./errors";

export function officialOperatorPolicy(environment: OperatorEnvironment): OperatorPolicy {
  const settings = getAttestorSettings(environment);
  return {
    environment,
    chainKey: settings.chainKey,
    electionMode: settings.electionMode,
    minAttestorBalanceAtomic: ctcAmountToAtomic(settings.minFreeBalanceCtc),
    recommendedAttestorBalanceAtomic: ctcAmountToAtomic(settings.recommendedFreeBalanceCtc),
    minBondAtomic: ctcAmountToAtomic(settings.minBondRequirementCtc),
    requireAuthorizationInAuthorizedOnly: settings.electionMode === "AuthorizedOnly",
    requireSeparateStash: true,
    requireP2PInbound: true,
    requireStablePublicAddress: true,
    requireHistoricalEthereumRpc: settings.externalEthRpcRequired,
    epochSeconds: 12 * 60 * 60,
    p2pPort: settings.p2pPort,
    apiPort: settings.metricsPort,
    normalEthRequestsPerDay: 15000,
    maxEthConcurrentRequests: 20,
  };
}

export function supportedElectionMode(value: string | undefined): ElectionMode {
  if (value === "OpenToAny" || value === "DeniedToAll") return value;
  return "AuthorizedOnly";
}

export function minimumBalanceMet(balanceAtomic: bigint, policy: OperatorPolicy): boolean {
  const parsed = parseAtomicBalance(policy.minAttestorBalanceAtomic);
  return parsed.ok && balanceAtomic >= parsed.value;
}

export function recommendedBalanceMet(balanceAtomic: bigint, policy: OperatorPolicy): boolean {
  const parsed = parseAtomicBalance(policy.recommendedAttestorBalanceAtomic);
  return parsed.ok && balanceAtomic >= parsed.value;
}

export function bondRequirementMet(balanceAtomic: bigint, policy: OperatorPolicy): boolean {
  const parsed = parseAtomicBalance(policy.minBondAtomic);
  return parsed.ok && balanceAtomic >= parsed.value;
}

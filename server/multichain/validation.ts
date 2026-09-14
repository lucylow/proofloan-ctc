import {
  MULTICHAIN_REGISTRY,
  isAttestcoinEnvironmentId,
  isAttestcoinSourceChainName,
  registryIntegrityIssues,
  type AttestcoinEnvironmentId,
  type AttestcoinSourceChainName,
} from "@shared/multichain";
import { AttestcoinError } from "../attestcoin/errors";
import { operationalRegistryAlignmentIssues } from "./environment-v2/compatibility";
import { validateAllOfficialEnvironments } from "./environment-v2/validation";

export function assertRegistryIntegrity() {
  const issues = [
    ...registryIntegrityIssues(MULTICHAIN_REGISTRY),
    ...validateAllOfficialEnvironments(),
    ...operationalRegistryAlignmentIssues(),
  ];
  if (issues.length > 0) {
    throw new AttestcoinError(
      "VALIDATION",
      `Attestcoin multi-chain registry is invalid: ${issues.join(" ")}`,
    );
  }
  return true;
}

export function parseEnvironmentId(
  value: string | undefined,
): AttestcoinEnvironmentId {
  const normalized = (value ?? "cc3-testnet").trim().toLowerCase();
  if (!isAttestcoinEnvironmentId(normalized)) {
    throw new AttestcoinError(
      "VALIDATION",
      `Unknown Attestcoin environment '${value}'. Use cc3-testnet or cc3-mainnet.`,
    );
  }
  return normalized;
}

export function parseSourceChainName(
  value: string,
): AttestcoinSourceChainName {
  if (!isAttestcoinSourceChainName(value)) {
    throw new AttestcoinError(
      "VALIDATION",
      `Unsupported Attestcoin source chain: ${value}`,
    );
  }
  return value;
}

export function assertPositiveInteger(label: string, value: number) {
  if (!Number.isInteger(value) || value <= 0) {
    throw new AttestcoinError(
      "VALIDATION",
      `${label} must be a positive integer.`,
    );
  }
  return value;
}

export function assertNonEmptyUrlList(label: string, urls: readonly string[]) {
  if (urls.length === 0) {
    throw new AttestcoinError(
      "VALIDATION",
      `${label} requires at least one RPC URL.`,
    );
  }
  for (const url of urls) {
    if (!/^https?:\/\//.test(url)) {
      throw new AttestcoinError(
        "VALIDATION",
        `${label} contains an invalid RPC URL.`,
      );
    }
  }
  return urls.slice();
}

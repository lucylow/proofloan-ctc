import { getAttestorSettings } from "./registry";
import type { AttestorNetwork, OperatorConfig } from "./types";
import { validateOperatorConfig } from "./validation";

export function buildDiagnostics(network: AttestorNetwork, config: OperatorConfig) {
  const settings = getAttestorSettings(network);
  const validation = validateOperatorConfig(network, config);
  return {
    network,
    sourceChain: settings.sourceChain,
    chainKey: settings.chainKey,
    image: settings.releaseImage,
    cc3Rpc: redactEndpoint(config.cc3Url),
    ethRpc: redactEndpoint(config.ethUrl),
    p2pPort: config.p2pPort,
    apiPort: config.apiPort,
    bootNodes: config.bootNodes.length,
    minFreeBalanceCtc: settings.minFreeBalanceCtc,
    recommendedFreeBalanceCtc: settings.recommendedFreeBalanceCtc,
    minBondRequirementCtc: settings.minBondRequirementCtc,
    electionMode: settings.electionMode,
    validConfig: validation.valid,
    issueCount: validation.issues.length,
    fingerprint: validation.fingerprint,
  };
}

export function redactEndpoint(value: string): string {
  try {
    const url = new URL(value);
    if (url.username || url.password) {
      url.username = "***";
      url.password = "***";
    }
    url.search = url.search ? "?redacted" : "";
    return url.toString();
  } catch {
    return "[invalid-endpoint]";
  }
}

import { findOfficialChain, getOfficialEnvironment, isOfficialEnvironment } from "./official";
import type {
  EnvironmentResolution,
  OfficialChainResolution,
  OfficialEnvironmentId,
} from "./types";
import { AttestcoinError } from "../../attestcoin/errors";

const DEFAULT_ENVIRONMENT: OfficialEnvironmentId = "cc3-testnet";

export function resolveOfficialEnvironment(input?: {
  explicit?: string;
  env?: string;
}): EnvironmentResolution {
  const explicit = input?.explicit?.trim();
  if (explicit) {
    if (isOfficialEnvironment(explicit)) {
      return { environment: explicit, reason: "explicit", warnings: [] };
    }
    return {
      environment: DEFAULT_ENVIRONMENT,
      reason: "unsupported",
      warnings: [`Unsupported explicit environment: ${explicit}`],
    };
  }

  const env = input?.env?.trim();
  if (env && isOfficialEnvironment(env)) {
    return { environment: env, reason: "env", warnings: [] };
  }
  if (env) {
    return {
      environment: DEFAULT_ENVIRONMENT,
      reason: "unsupported",
      warnings: [`Unsupported ATTESTCOIN_ENVIRONMENT: ${env}`],
    };
  }

  return {
    environment: DEFAULT_ENVIRONMENT,
    reason: "default",
    warnings: ["Defaulting to CC3 Testnet"],
  };
}

export function resolveFromQueryParam(value?: string): EnvironmentResolution {
  const query = value?.trim();
  if (!query) return resolveOfficialEnvironment();
  if (isOfficialEnvironment(query)) {
    return { environment: query, reason: "query", warnings: [] };
  }
  return {
    environment: DEFAULT_ENVIRONMENT,
    reason: "unsupported",
    warnings: [`Unsupported query environment: ${query}`],
  };
}

export function resolveFromWalletChainId(chainId?: number): EnvironmentResolution {
  if (chainId === undefined) return resolveOfficialEnvironment();
  if (chainId === 11155111) {
    return { environment: "cc3-testnet", reason: "wallet", warnings: [] };
  }
  if (chainId === 1) {
    return {
      environment: DEFAULT_ENVIRONMENT,
      reason: "wallet",
      warnings: [
        "Ethereum Mainnet is official on both CC3 Testnet (chainKey 3) and CC3 Mainnet (chainKey 1); defaulted to testnet",
      ],
    };
  }
  return {
    environment: DEFAULT_ENVIRONMENT,
    reason: "unsupported",
    warnings: [`Wallet chain ${chainId} is not an official Attestcoin source chain`],
  };
}

export function resolveByChain(input: {
  environment?: string;
  chain: string;
}): OfficialChainResolution {
  const requestedEnvironment = input.environment;
  const chain = input.chain.trim();
  if (
    requestedEnvironment === "cc3-mainnet" ||
    requestedEnvironment === "cc3-testnet"
  ) {
    const hit = findOfficialChain(requestedEnvironment, chain);
    if (hit) {
      return {
        environment: requestedEnvironment,
        chainId: hit.id,
        warnings: [],
      };
    }
    return {
      environment: requestedEnvironment,
      chainId: chain,
      warnings: [
        `Chain ${chain} is not officially enabled in ${requestedEnvironment}`,
      ],
    };
  }

  const testnetHit = findOfficialChain("cc3-testnet", chain);
  const mainnetHit = findOfficialChain("cc3-mainnet", chain);
  if (testnetHit && !mainnetHit) {
    return { environment: "cc3-testnet", chainId: testnetHit.id, warnings: [] };
  }
  if (mainnetHit && !testnetHit) {
    return { environment: "cc3-mainnet", chainId: mainnetHit.id, warnings: [] };
  }
  if (testnetHit && mainnetHit) {
    return {
      environment: "cc3-testnet",
      chainId: testnetHit.id,
      warnings: ["Chain exists in multiple environments; defaulted to testnet"],
    };
  }
  return {
    environment: DEFAULT_ENVIRONMENT,
    chainId: chain,
    warnings: [`Unknown chain: ${chain}`],
  };
}

export function explainSelection(environment: string): string {
  return getOfficialEnvironment(environment)
    .chains.map(chain => `${chain.displayName}: chainKey=${chain.chainKey}`)
    .join(" | ");
}

export function assertOfficialChainSelection(input: {
  environment?: string;
  chain: string;
}): { environment: OfficialEnvironmentId; chainId: string; chainKey: number } {
  const resolved = resolveByChain(input);
  const chain = findOfficialChain(resolved.environment, resolved.chainId);
  if (!chain || resolved.warnings.length > 0) {
    throw new AttestcoinError(
      "UNSUPPORTED_CHAIN",
      `Unsupported chain/environment selection: ${resolved.environment}/${input.chain}. ${resolved.warnings.join("; ")}`,
    );
  }
  return {
    environment: resolved.environment,
    chainId: chain.id,
    chainKey: chain.chainKey,
  };
}

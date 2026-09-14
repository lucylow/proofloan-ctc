import type { AttestcoinSourceChain } from "@shared/attestcoin";
import {
  getCachedAttestcoinEnvironment,
  resolveSourceChain,
} from "../multichain";

export type AttestcoinChainConfig = {
  name: AttestcoinSourceChain;
  chainKey: number | null;
  rpcUrl: string;
  rpcUrls: readonly string[];
  explorerBaseUrl: string;
  enabled: boolean;
  liveProofEnabled: boolean;
  experimental: boolean;
  environment: string;
};

export function getAttestcoinRuntimeConfig() {
  const environment = getCachedAttestcoinEnvironment();
  return {
    creditcoinRpc: environment.creditcoinRpcUrl,
    proofBuilderUrl: environment.proofBuilderUrl,
    timeoutMs: environment.timeoutMs,
    retryCount: environment.retryCount,
    cacheTtlMs: environment.cacheTtlMs,
    maxConcurrentProofs: environment.maxConcurrentProofs,
    environment: environment.id,
    decoderContract: environment.decoderContract,
  };
}

export const ATTESTCOIN_CONFIG = new Proxy({} as ReturnType<typeof getAttestcoinRuntimeConfig>, {
  get(_target, property, receiver) {
    return Reflect.get(getAttestcoinRuntimeConfig(), property, receiver);
  },
}) as ReturnType<typeof getAttestcoinRuntimeConfig>;

export function getAttestcoinChainConfig(chain: AttestcoinSourceChain): AttestcoinChainConfig {
  const resolved = resolveSourceChain(chain);
  return {
    name: chain,
    chainKey: resolved.chainKey,
    rpcUrl: resolved.rpcUrl,
    rpcUrls: resolved.rpcUrls,
    explorerBaseUrl: resolved.explorerTxBaseUrl,
    enabled: true,
    liveProofEnabled: resolved.liveProofEnabled,
    experimental: resolved.experimental,
    environment: resolved.environment,
  };
}

export const ATTESTCOIN_CHAINS: Record<AttestcoinSourceChain, AttestcoinChainConfig> = new Proxy(
  {} as Record<AttestcoinSourceChain, AttestcoinChainConfig>,
  {
    get(_target, property) {
      if (typeof property !== "string") return undefined;
      if (
        property !== "Ethereum Sepolia" &&
        property !== "Ethereum Mainnet" &&
        property !== "Polygon Amoy"
      ) {
        return undefined;
      }
      return getAttestcoinChainConfig(property);
    },
    ownKeys() {
      return ["Ethereum Sepolia", "Ethereum Mainnet", "Polygon Amoy"];
    },
    getOwnPropertyDescriptor(_target, property) {
      if (
        property === "Ethereum Sepolia" ||
        property === "Ethereum Mainnet" ||
        property === "Polygon Amoy"
      ) {
        return {
          configurable: true,
          enumerable: true,
          value: getAttestcoinChainConfig(property),
        };
      }
      return undefined;
    },
  },
);

import { JsonRpcProvider } from "ethers";
import type { AttestcoinSourceChainName } from "@shared/multichain";
import { getCachedAttestcoinEnvironment } from "./environment";
import { FailoverExhaustedError, withFailover } from "./failover";
import { recordMultichainEvent } from "./observability";
import { getNamedCircuit } from "./circuitBreaker";
import { resolveSourceChain } from "./registry";
import { AttestcoinError } from "../attestcoin/errors";

const providers = new Map<string, JsonRpcProvider>();

export function getJsonRpcProvider(url: string): JsonRpcProvider {
  const existing = providers.get(url);
  if (existing) return existing;
  const provider = new JsonRpcProvider(url);
  providers.set(url, provider);
  return provider;
}

export function listPooledProviderUrls() {
  return Array.from(providers.keys());
}

export function resetProviderPool() {
  providers.clear();
}

export function normalizeRpcFailure(label: string, error: unknown): never {
  if (error instanceof AttestcoinError) throw error;
  if (error instanceof FailoverExhaustedError) {
    throw new AttestcoinError("SOURCE_RPC", error.message, {
      retriable: true,
      causeValue: error,
    });
  }
  throw new AttestcoinError(
    "SOURCE_RPC",
    error instanceof Error ? error.message : `${label} RPC failed.`,
    { retriable: true, causeValue: error },
  );
}

export async function withProviderUrls<T>(
  urls: readonly string[],
  operation: (provider: JsonRpcProvider, url: string) => Promise<T>,
  label: string,
): Promise<T> {
  const circuit = getNamedCircuit(`rpc:${label}`);
  try {
    const result = await circuit.run(() =>
      withFailover(
        urls,
        async (url, index) => {
          const provider = getJsonRpcProvider(url);
          try {
            const value = await operation(provider, url);
            recordMultichainEvent("rpc_success", url);
            if (index > 0) recordMultichainEvent("rpc_failover", url);
            return value;
          } catch (error) {
            recordMultichainEvent("rpc_failure", url);
            throw error;
          }
        },
        { label },
      ),
    );
    return result.value;
  } catch (error) {
    normalizeRpcFailure(label, error);
  }
}

export async function withSourceRpc<T>(
  chain: AttestcoinSourceChainName,
  operation: (provider: JsonRpcProvider, url: string) => Promise<T>,
) {
  const resolved = resolveSourceChain(chain);
  return withProviderUrls(
    resolved.rpcUrls,
    operation,
    `source:${resolved.id}`,
  );
}

export async function withCreditcoinRpc<T>(
  operation: (provider: JsonRpcProvider, url: string) => Promise<T>,
) {
  const environment = getCachedAttestcoinEnvironment();
  return withProviderUrls(
    environment.creditcoinRpcUrls,
    operation,
    `creditcoin:${environment.id}`,
  );
}

export function sourceRpcUrlsFor(chain: AttestcoinSourceChainName) {
  return resolveSourceChain(chain).rpcUrls;
}

export function creditcoinRpcUrls() {
  return getCachedAttestcoinEnvironment().creditcoinRpcUrls;
}

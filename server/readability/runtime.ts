import type { ReadabilityConfig } from "./types";
import { ReadabilityService } from "./service";
import { readabilityOffchainRuntime } from "./offchain-runtime";

export function readabilityConfigFromEnv(env: NodeJS.ProcessEnv = process.env): ReadabilityConfig {
  return {
    environment: env.ATTESTCOIN_ENVIRONMENT === "cc3-mainnet" ? "cc3-mainnet" : "cc3-testnet",
    pollIntervalMs: 3_000,
    maxBatchSize: 20,
    reorgBufferBlocks: 2,
    attestationTimeoutMs: 120_000,
    proofTimeoutMs: 120_000,
    deliveryTimeoutMs: 120_000,
    maxRetries: 4,
    gasAware: env.ATTESTCOIN_GAS_AWARE === "true",
  };
}

export const readabilityService = new ReadabilityService(readabilityConfigFromEnv());

export function resetReadabilityRuntime(): void {
  readabilityService.reset();
  readabilityOffchainRuntime.reset();
}

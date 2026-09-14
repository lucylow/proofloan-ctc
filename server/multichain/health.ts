import type { AttestcoinHealth, AttestcoinSourceChain } from "@shared/attestcoin";
import { getCachedAttestcoinEnvironment } from "./environment";
import { resolveSourceChain } from "./registry";
import { recordMultichainEvent } from "./observability";

type ProbeStatus = AttestcoinHealth["creditcoinRpc"];

export type MultichainHealth = AttestcoinHealth & {
  environment: string;
  sourceChain: AttestcoinSourceChain;
  liveProofEnabled: boolean;
  experimental: boolean;
  chainKey: number | null;
};

async function withTimeout<T>(operation: Promise<T>, timeoutMs: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      operation,
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => reject(new Error("timeout")), timeoutMs);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

async function checkRpc(url: string, timeoutMs: number, expectedChainId?: number) {
  const started = Date.now();
  const { JsonRpcProvider } = await import("ethers");
  const provider = new JsonRpcProvider(url);
  try {
    const [blockNumber, network] = await Promise.all([
      withTimeout(provider.getBlockNumber(), timeoutMs),
      expectedChainId
        ? withTimeout(provider.getNetwork(), timeoutMs)
        : Promise.resolve(undefined),
    ]);
    void blockNumber;
    if (expectedChainId && network && Number(network.chainId) !== expectedChainId) {
      throw new Error(
        `chain ID ${Number(network.chainId)} does not match expected ${expectedChainId}`,
      );
    }
    return { ok: true, latencyMs: Date.now() - started };
  } finally {
    provider.destroy?.();
  }
}

async function checkHttp(url: string, timeoutMs: number) {
  const started = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      method: "GET",
      signal: controller.signal,
    });
    return {
      ok: response.status < 500,
      latencyMs: Date.now() - started,
    };
  } finally {
    clearTimeout(timeout);
  }
}

function classify(
  result: PromiseSettledResult<{ ok: boolean; latencyMs: number }>,
): ProbeStatus {
  if (result.status === "fulfilled" && result.value.ok) {
    return result.value.latencyMs > 5_000 ? "degraded" : "healthy";
  }
  return "offline";
}

export async function checkMultichainHealth(
  sourceChain: AttestcoinSourceChain,
): Promise<MultichainHealth> {
  const started = Date.now();
  const environment = getCachedAttestcoinEnvironment();
  const source = resolveSourceChain(sourceChain, { environment });
  recordMultichainEvent("health_probe", source.id);

  const results = await Promise.allSettled([
    checkRpc(environment.creditcoinRpcUrl, environment.timeoutMs, environment.evmChainId),
    checkHttp(environment.proofBuilderUrl, environment.timeoutMs),
    checkRpc(source.rpcUrl, environment.timeoutMs),
  ]);

  const [creditcoin, builder, sourceRpc] = results;
  const creditcoinRpc = classify(creditcoin);
  const proofBuilder = classify(builder);
  const sourceStatus = classify(sourceRpc);
  const degraded = [creditcoinRpc, proofBuilder, sourceStatus].some(
    status => status !== "healthy",
  );

  const experimentalNote = source.experimental
    ? " Polygon Amoy is experimental and cannot produce a live Attestcoin proof."
    : "";

  return {
    creditcoinRpc,
    proofBuilder,
    sourceRpc: sourceStatus,
    lastCheckedAt: new Date().toISOString(),
    latencyMs: Date.now() - started,
    message: degraded
      ? `One or more Attestcoin dependencies are degraded; live proofs may fail closed.${experimentalNote}`
      : source.experimental
        ? experimentalNote.trim()
        : undefined,
    environment: environment.id,
    sourceChain,
    liveProofEnabled: source.liveProofEnabled,
    experimental: source.experimental,
    chainKey: source.chainKey,
  };
}

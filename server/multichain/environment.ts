import {
  DEFAULT_ATTESTCOIN_ENVIRONMENT,
  MULTICHAIN_REGISTRY,
  getEnvironmentRecord,
  listChainCapabilities,
  rpcUrlConflictsWithEnvironment,
  type AttestcoinEnvironmentId,
  type CreditcoinEnvironmentRecord,
} from "@shared/multichain";
import { AttestcoinError } from "../attestcoin/errors";
import { environmentCapabilities } from "./environment-v2/capabilities";
import { environmentFingerprint } from "./environment-v2/fingerprint";
import { getPublicEnvironmentManifest } from "./environment-v2/publicManifest";
import { parseEnvironmentId } from "./validation";
import { resolveDeployedProofLoanContracts } from "../deploy/addresses";

export type ProcessEnvLike = Record<string, string | undefined>;

export type ResolvedAttestcoinEnvironment = CreditcoinEnvironmentRecord & {
  requestedId: AttestcoinEnvironmentId;
  creditcoinRpcUrl: string;
  creditcoinRpcUrls: string[];
  proofBuilderUrl: string;
  timeoutMs: number;
  retryCount: number;
  cacheTtlMs: number;
  maxConcurrentProofs: number;
  staleProofMaxAgeMs: number;
  rejectStaleLiveProofs: boolean;
  warnings: string[];
};

function readNumber(env: ProcessEnvLike, key: string, fallback: number) {
  const raw = env[key];
  if (raw === undefined || raw.trim() === "") return fallback;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function readBoolean(env: ProcessEnvLike, key: string, fallback: boolean) {
  const raw = env[key];
  if (raw === undefined || raw.trim() === "") return fallback;
  const normalized = raw.trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "off"].includes(normalized)) return false;
  return fallback;
}

function firstNonEmpty(...values: Array<string | undefined>) {
  for (const value of values) {
    const trimmed = value?.trim();
    if (trimmed) return trimmed;
  }
  return undefined;
}

function splitUrls(value: string | undefined): string[] {
  return (value ?? "")
    .split(",")
    .map(part => part.trim())
    .filter(Boolean);
}

function environmentSpecificRpcKeys(environmentId: AttestcoinEnvironmentId) {
  if (environmentId === "cc3-mainnet") {
    return {
      list: "CREDITCOIN_MAINNET_RPC_URLS",
      single: "CREDITCOIN_MAINNET_RPC_URL",
    } as const;
  }
  return {
    list: "CREDITCOIN_TESTNET_RPC_URLS",
    single: "CREDITCOIN_TESTNET_RPC_URL",
  } as const;
}

export function resolveCreditcoinRpcUrls(
  environmentId: AttestcoinEnvironmentId,
  env: ProcessEnvLike = process.env,
  fallback: readonly string[] = getEnvironmentRecord(environmentId).rpcUrls,
): { urls: string[]; warnings: string[] } {
  const warnings: string[] = [];
  const keys = environmentSpecificRpcKeys(environmentId);
  const specificCandidates = [env[keys.list], env[keys.single]];
  const genericCandidates = [env.CREDITCOIN_RPC_URLS, env.CREDITCOIN_RPC_URL];

  const takeCompatible = (
    raw: string | undefined,
    { requireCompatible }: { requireCompatible: boolean },
  ) => {
    const urls = splitUrls(raw);
    if (urls.length === 0) return undefined;
    const compatible: string[] = [];
    for (const url of urls) {
      const conflict = rpcUrlConflictsWithEnvironment(url, environmentId);
      if (conflict) {
        if (requireCompatible) {
          throw new AttestcoinError("VALIDATION", conflict);
        }
        warnings.push(conflict);
        continue;
      }
      compatible.push(url);
    }
    return compatible.length > 0 ? compatible : undefined;
  };

  for (const candidate of specificCandidates) {
    const urls = takeCompatible(candidate, { requireCompatible: true });
    if (urls) return { urls, warnings };
  }
  for (const candidate of genericCandidates) {
    const urls = takeCompatible(candidate, { requireCompatible: false });
    if (urls) return { urls, warnings };
  }

  if (warnings.length > 0) {
    warnings.push(
      `Ignored mismatched CREDITCOIN_RPC_URL override(s) and used the documented ${environmentId} RPC list.`,
    );
  }
  return { urls: [...fallback], warnings };
}

export function resolveAttestcoinEnvironment(
  env: ProcessEnvLike = process.env,
): ResolvedAttestcoinEnvironment {
  const requestedId = parseEnvironmentId(
    env.ATTESTCOIN_ENVIRONMENT ?? DEFAULT_ATTESTCOIN_ENVIRONMENT,
  );
  const record = getEnvironmentRecord(requestedId);
  const resolvedRpc = resolveCreditcoinRpcUrls(requestedId, env, record.rpcUrls);
  const creditcoinRpcUrls = resolvedRpc.urls;
  const proofBuilderUrl =
    firstNonEmpty(
      env.CREDITCOIN_PROOF_BUILDER_URL,
      env.PROOF_BUILDER_URL,
    ) ?? record.proofBuilderUrl;
  const warnings = [...resolvedRpc.warnings];
  if (
    requestedId === "cc3-mainnet" &&
    readBoolean(env, "PROOFLOAN_DEMO_MODE", false)
  ) {
    warnings.push(
      "PROOFLOAN_DEMO_MODE is enabled while targeting CC3 Mainnet. Live mainnet traffic should disable demo fallback.",
    );
  }

  return {
    ...record,
    requestedId,
    creditcoinRpcUrl: creditcoinRpcUrls[0]!,
    creditcoinRpcUrls,
    proofBuilderUrl,
    timeoutMs: readNumber(env, "ATTESTCOIN_TIMEOUT_MS", 15_000),
    retryCount: readNumber(env, "ATTESTCOIN_RETRY_COUNT", 2),
    cacheTtlMs: readNumber(env, "ATTESTCOIN_CACHE_TTL_MS", 120_000),
    maxConcurrentProofs: readNumber(env, "ATTESTCOIN_MAX_CONCURRENCY", 2),
    staleProofMaxAgeMs: readNumber(env, "ATTESTCOIN_STALE_PROOF_MAX_AGE_MS", 86_400_000),
    rejectStaleLiveProofs: readBoolean(env, "ATTESTCOIN_REJECT_STALE_PROOFS", true),
    warnings,
  };
}

export function getActiveEnvironmentId(
  env: ProcessEnvLike = process.env,
): AttestcoinEnvironmentId {
  return resolveAttestcoinEnvironment(env).id;
}

export function getPublicEnvironmentSnapshot(
  env: ProcessEnvLike = process.env,
) {
  const resolved = resolveAttestcoinEnvironment(env);
  return {
    environment: resolved.id,
    label: resolved.label,
    networkKind: resolved.networkKind,
    decoderContract: resolved.decoderContract,
    explorerUrl: resolved.explorerUrl,
    nativeSymbol: resolved.nativeSymbol,
    evmChainId: resolved.evmChainId,
    evmVersion: resolved.evmVersion,
    warnings: resolved.warnings,
    proofBuilderUrl: resolved.proofBuilderUrl,
    dashboardUrl: resolved.dashboardUrl,
    chainInfoPrecompile: resolved.chainInfoPrecompile,
    blockProverPrecompile: resolved.blockProverPrecompile,
    fingerprint: environmentFingerprint(resolved.id),
    officialCapabilities: environmentCapabilities(resolved.id),
    officialManifest: getPublicEnvironmentManifest(resolved.id),
    capabilities: listChainCapabilities(resolved.id),
    documentedEnvironments: Object.values(MULTICHAIN_REGISTRY.environments).map(
      item => ({
        id: item.id,
        label: item.label,
        networkKind: item.networkKind,
        evmChainId: item.evmChainId,
        explorerUrl: item.explorerUrl,
      }),
    ),
    deployedContracts: resolveDeployedProofLoanContracts(resolved.id, env),
  };
}

let cached: { key: string; value: ResolvedAttestcoinEnvironment } | undefined;

export function getCachedAttestcoinEnvironment(
  env: ProcessEnvLike = process.env,
): ResolvedAttestcoinEnvironment {
  const key = [
    env.ATTESTCOIN_ENVIRONMENT,
    env.CREDITCOIN_RPC_URL,
    env.CREDITCOIN_RPC_URLS,
    env.CREDITCOIN_TESTNET_RPC_URL,
    env.CREDITCOIN_TESTNET_RPC_URLS,
    env.CREDITCOIN_MAINNET_RPC_URL,
    env.CREDITCOIN_MAINNET_RPC_URLS,
    env.CREDITCOIN_PROOF_BUILDER_URL,
    env.PROOF_BUILDER_URL,
    env.ATTESTCOIN_TIMEOUT_MS,
    env.ATTESTCOIN_STALE_PROOF_MAX_AGE_MS,
    env.ATTESTCOIN_REJECT_STALE_PROOFS,
  ].join("|");
  if (cached?.key === key) return cached.value;
  const value = resolveAttestcoinEnvironment(env);
  cached = { key, value };
  return value;
}

export function resetEnvironmentCache() {
  cached = undefined;
}

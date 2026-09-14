import {
  chainCapability,
  getOfficialBinding,
  getSourceChainRecord,
  type AttestcoinEnvironmentId,
  type AttestcoinSourceChainName,
  type ChainCapability,
  type OfficialSourceBinding,
  type SourceChainCatalogRecord,
} from "@shared/multichain";
import { AttestcoinError } from "../attestcoin/errors";
import {
  getCachedAttestcoinEnvironment,
  type ProcessEnvLike,
  type ResolvedAttestcoinEnvironment,
} from "./environment";
import { officialRegistry } from "./environment-v2/registry";
import { assertNonEmptyUrlList } from "./validation";

export type SourceRpcOverrides = Partial<
  Record<AttestcoinSourceChainName, string | string[]>
>;

export type ResolvedSourceChain = Omit<SourceChainCatalogRecord, "rpcUrls"> & {
  environment: AttestcoinEnvironmentId;
  rpcUrl: string;
  rpcUrls: readonly string[];
  chainKey: number | null;
  genesisBlock: number | null;
  liveProofEnabled: boolean;
  experimental: boolean;
  capability: ChainCapability;
  officialBinding?: OfficialSourceBinding;
};

function asUrlList(value: string | string[] | undefined, fallback: readonly string[]) {
  if (Array.isArray(value) && value.length > 0) return value.map(item => item.trim()).filter(Boolean);
  if (typeof value === "string" && value.trim()) {
    return value
      .split(",")
      .map(item => item.trim())
      .filter(Boolean);
  }
  return Array.from(fallback);
}

export function sourceRpcOverridesFromEnv(
  env: ProcessEnvLike = process.env,
): SourceRpcOverrides {
  return {
    "Ethereum Sepolia": env.ETHEREUM_SEPOLIA_RPC_URL,
    "Ethereum Mainnet": env.ETHEREUM_MAINNET_RPC_URL,
    "Polygon Amoy": env.POLYGON_AMOY_RPC_URL,
  };
}

export function resolveSourceChain(
  chain: AttestcoinSourceChainName,
  options: {
    environment?: AttestcoinEnvironmentId | ResolvedAttestcoinEnvironment;
    env?: ProcessEnvLike;
    rpcOverrides?: SourceRpcOverrides;
  } = {},
): ResolvedSourceChain {
  const resolvedEnvironment =
    typeof options.environment === "object"
      ? options.environment
      : getCachedAttestcoinEnvironment(options.env);
  const environmentId =
    typeof options.environment === "string"
      ? options.environment
      : resolvedEnvironment.id;
  const catalog = getSourceChainRecord(chain);
  const binding = getOfficialBinding(environmentId, chain);
  const capability = chainCapability(environmentId, chain);
  const rpcUrls = assertNonEmptyUrlList(
    `${chain} RPC`,
    asUrlList(
      options.rpcOverrides?.[chain] ??
        sourceRpcOverridesFromEnv(options.env)[chain],
      catalog.rpcUrls,
    ),
  );

  return {
    id: catalog.id,
    name: catalog.name,
    evmChainId: catalog.evmChainId,
    nativeSymbol: catalog.nativeSymbol,
    explorerTxBaseUrl: catalog.explorerTxBaseUrl,
    support: catalog.support,
    previewEnabled: catalog.previewEnabled,
    liveProofDefault: catalog.liveProofDefault,
    preview: catalog.preview,
    confirmationDepth: catalog.confirmationDepth,
    staleAfterBlocks: catalog.staleAfterBlocks,
    environment: environmentId,
    rpcUrl: rpcUrls[0]!,
    rpcUrls,
    chainKey: binding?.chainKey ?? null,
    genesisBlock: binding?.genesisBlock ?? null,
    liveProofEnabled: capability.liveProof,
    experimental: catalog.support === "experimental",
    capability,
    officialBinding: binding,
  };
}

export function requireOfficialChainKey(
  chain: AttestcoinSourceChainName,
  environment?: AttestcoinEnvironmentId | ResolvedAttestcoinEnvironment,
): number {
  const resolved = resolveSourceChain(chain, { environment });
  const official = officialRegistry.getChain(resolved.environment, resolved.id);
  if (resolved.chainKey === null || !official) {
    throw new AttestcoinError(
      "UNSUPPORTED_CHAIN",
      resolved.capability.reason ??
        `${chain} has no official Attestcoin chainkey in ${resolved.environment}.`,
    );
  }
  if (official.chainKey !== resolved.chainKey) {
    throw new AttestcoinError(
      "VALIDATION",
      `Official chainKey for ${chain} in ${resolved.environment} drifted from the Attestcoin Protocol documentation registry.`,
    );
  }
  return official.chainKey;
}

export function isLiveProofChain(
  chain: AttestcoinSourceChainName,
  environment?: AttestcoinEnvironmentId,
) {
  return resolveSourceChain(chain, { environment }).liveProofEnabled;
}

export function listResolvedSourceChains(
  environment?: AttestcoinEnvironmentId,
) {
  return (["Ethereum Sepolia", "Ethereum Mainnet", "Polygon Amoy"] as const).map(
    chain => resolveSourceChain(chain, { environment }),
  );
}

// Official documentation-backed registry. Prefer this for production chain/environment checks.
export { officialRegistry } from "./environment-v2/registry";
export {
  getOfficialEnvironment,
  findOfficialChain,
  OFFICIAL_ATTESTCOIN_ENVIRONMENTS,
} from "./environment-v2/official";

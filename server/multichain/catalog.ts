import {
  BLOCK_PROVER_PRECOMPILE,
  CHAININFO_PRECOMPILE,
  MULTICHAIN_REGISTRY,
  listChainCapabilities,
  type AttestcoinEnvironmentId,
} from "@shared/multichain";
import { getCachedAttestcoinEnvironment, resolveAttestcoinEnvironment } from "./environment";
import {
  parseEnvironmentConfig,
  parseSourceChainConfig,
  productionAscModelSchema,
  productionCostModelSchema,
} from "./configSchema";
import { allEnvironmentDiagnostics, environmentDiagnostics } from "./environment-v2/diagnostics";
import { environmentFingerprint } from "./environment-v2/fingerprint";
import { getPublicEnvironmentManifest } from "./environment-v2/publicManifest";
import { listResolvedSourceChains } from "./registry";

export function getPublicChainCatalog(environment?: AttestcoinEnvironmentId) {
  const resolved = environment
    ? resolveAttestcoinEnvironment({ ATTESTCOIN_ENVIRONMENT: environment })
    : getCachedAttestcoinEnvironment();
  const environmentConfig = parseEnvironmentConfig({
    id: resolved.id,
    label: resolved.label,
    networkKind: resolved.networkKind,
    evmChainId: resolved.evmChainId,
    creditcoinRpcUrl: resolved.creditcoinRpcUrl,
    creditcoinRpcUrls: resolved.creditcoinRpcUrls,
    proofBuilderUrl: resolved.proofBuilderUrl,
    decoderContract: resolved.decoderContract,
    chainInfoPrecompile: resolved.chainInfoPrecompile,
    blockProverPrecompile: resolved.blockProverPrecompile,
    timeoutMs: resolved.timeoutMs,
    retryCount: resolved.retryCount,
    cacheTtlMs: resolved.cacheTtlMs,
    maxConcurrentProofs: resolved.maxConcurrentProofs,
    staleProofMaxAgeMs: resolved.staleProofMaxAgeMs,
    rejectStaleLiveProofs: resolved.rejectStaleLiveProofs,
  });
  const sourceChains = listResolvedSourceChains(resolved.id).map(chain =>
    parseSourceChainConfig({
      name: chain.name,
      evmChainId: chain.evmChainId,
      rpcUrl: chain.rpcUrl,
      rpcUrls: [...chain.rpcUrls],
      support: chain.support,
      chainKey: chain.chainKey,
      liveProofEnabled: chain.liveProofEnabled,
      experimental: chain.experimental,
      confirmationDepth: chain.confirmationDepth,
      staleAfterBlocks: chain.staleAfterBlocks,
      previewEnabled: chain.previewEnabled,
    }),
  );

  return {
    environment: environmentConfig,
    sourceChains,
    capabilities: listChainCapabilities(resolved.id),
    officialBindings: MULTICHAIN_REGISTRY.officialBindings[resolved.id],
    experimentalChains: sourceChains.filter(chain => chain.experimental),
    documentedEnvironments: Object.values(MULTICHAIN_REGISTRY.environments).map(item => ({
      id: item.id,
      label: item.label,
      networkKind: item.networkKind,
    })),
    precompiles: {
      chainInfo: CHAININFO_PRECOMPILE,
      blockProver: BLOCK_PROVER_PRECOMPILE,
    },
    officialEnvironment: {
      fingerprint: environmentFingerprint(resolved.id),
      manifest: getPublicEnvironmentManifest(resolved.id),
      diagnostics: environmentDiagnostics(resolved.id),
      allEnvironments: allEnvironmentDiagnostics(),
    },
    ascModel: productionAscModelSchema.parse({
      blockProverPrecompile: BLOCK_PROVER_PRECOMPILE,
      verify: ["merkle", "continuity"],
      requireReceiptStatus: "0x1",
    }),
    costModel: productionCostModelSchema.parse({
      crossChainReads: "free",
      crossChainActions: "atc-paid",
      minting: false,
    }),
  };
}

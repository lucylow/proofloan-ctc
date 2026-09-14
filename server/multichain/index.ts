export {
  resolveAttestcoinEnvironment,
  getCachedAttestcoinEnvironment,
  getPublicEnvironmentSnapshot,
  resetEnvironmentCache,
} from "./environment";
export {
  resolveSourceChain,
  requireOfficialChainKey,
  isLiveProofChain,
  listResolvedSourceChains,
} from "./registry";
export { getJsonRpcProvider, withSourceRpc, withCreditcoinRpc, resetProviderPool } from "./rpc";
export { verifyLiveAttestcoinProof, type EnvironmentAwareProof } from "./proof";
export {
  normalizeEvidence,
  previewFactsFor,
  computeEvidenceRoot,
  freshnessScore,
  factFromVerifiedProof,
  factFromCanonicalProof,
  toVerifiedFact,
} from "./facts";
export { checkMultichainHealth } from "./health";
export { withFailover, FailoverExhaustedError } from "./failover";
export { NamedCircuitBreaker, getNamedCircuit, resetNamedCircuits } from "./circuitBreaker";
export { assertRegistryIntegrity, parseEnvironmentId, parseSourceChainName } from "./validation";
export { buildFeatureMatrix, featureEnabled, officialLiveProofChains } from "./featureMatrix";
export { classifyProofRequest, liveProofAllowed } from "./requestPolicy";
export { getSourceChainAdapter, previewTemplateFor } from "./sourceAdapters";
export {
  recordMultichainEvent,
  snapshotMultichainMetrics,
  resetMultichainMetrics,
} from "./observability";
export { getPublicChainCatalog } from "./catalog";
export {
  OFFICIAL_ATTESTCOIN_ENVIRONMENTS,
  allEnvironmentDiagnostics,
  assertOfficialChainSelection,
  buildPublicAttestcoinManifest,
  environmentDiagnostics,
  environmentFingerprint,
  findOfficialChain,
  getOfficialEnvironment,
  officialRegistry,
  resolveByChain,
  resolveOfficialEnvironment,
} from "./environment-v2";
export { finalizeVerifiedProof, canonicalRequestHash } from "./proofRecord";
export { featureVectorAdapter } from "./features";
export { creditcoinExecutionAdapter } from "./execution";
export { PRODUCTION_ADAPTER_BOUNDARIES } from "./adapters";
export { assertSuccessfulReceipt } from "./receipt";
export { resetProofIdempotency } from "./idempotency";

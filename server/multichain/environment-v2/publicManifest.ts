import { OFFICIAL_ATTESTCOIN_ENVIRONMENTS } from "./official";
import type { PublicOfficialEnvironmentManifest } from "./types";

/** Safe-to-ship manifest for UI, diagnostics and demos. Secrets never belong here. */
export function buildPublicAttestcoinManifest(): PublicOfficialEnvironmentManifest[] {
  return Object.values(OFFICIAL_ATTESTCOIN_ENVIRONMENTS).map(environment => ({
    id: environment.id,
    displayName: environment.displayName,
    networkKind: environment.networkKind,
    ascDashboardUrl: environment.ascDashboardUrl,
    proofBuilderUrl: environment.proofBuilderUrl,
    decoderContract: environment.decoderContract,
    chainInfoPrecompile: environment.chainInfoPrecompile,
    blockProverPrecompile: environment.blockProverPrecompile,
    sdkPackage: environment.sdkPackage,
    chains: environment.chains.map(chain => ({
      id: chain.id,
      displayName: chain.displayName,
      chainId: chain.chainId,
      chainKey: chain.chainKey,
      genesisBlock: chain.genesisBlock,
      rpcConfigured: Boolean(chain.rpcUrl),
      attestcoinEnabled: chain.attestcoinEnabled,
    })),
  }));
}

export function getPublicEnvironmentManifest(environment: string) {
  return (
    buildPublicAttestcoinManifest().find(entry => entry.id === environment) ??
    null
  );
}

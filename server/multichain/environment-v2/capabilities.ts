import { findOfficialChain, getOfficialEnvironment } from "./official";

export type EnvironmentCapability =
  | "proof-builder"
  | "decoder"
  | "chain-info"
  | "block-prover"
  | "sdk"
  | "source-read";

export function environmentCapabilities(
  environment: string,
): Record<EnvironmentCapability, boolean> {
  const descriptor = getOfficialEnvironment(environment);
  return {
    "proof-builder": descriptor.proofBuilderUrl.startsWith("https://"),
    decoder: descriptor.decoderContract.length === 42,
    "chain-info": descriptor.chainInfoPrecompile.toLowerCase().endsWith("fd3"),
    "block-prover": descriptor.blockProverPrecompile.toLowerCase().endsWith("fd2"),
    sdk: descriptor.sdkPackage === "@gluwa/usc-sdk",
    "source-read": descriptor.chains.length > 0,
  };
}

export function chainCapabilities(
  environment: string,
  chainId: string,
): Record<string, boolean> {
  const descriptor = findOfficialChain(environment, chainId);
  return {
    exists: Boolean(descriptor),
    official: descriptor?.support === "official",
    attestcoin: Boolean(descriptor?.attestcoinEnabled),
    proof: Boolean(
      descriptor?.attestcoinEnabled && descriptor?.chainKey !== undefined,
    ),
    sourceRpc: Boolean(descriptor?.rpcUrl),
  };
}

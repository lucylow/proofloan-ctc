import { createHash } from "node:crypto";
import { getOfficialEnvironment } from "./official";

export function environmentFingerprint(environment: string): string {
  const descriptor = getOfficialEnvironment(environment);
  const canonical = JSON.stringify({
    id: descriptor.id,
    decoderContract: descriptor.decoderContract.toLowerCase(),
    chainInfoPrecompile: descriptor.chainInfoPrecompile.toLowerCase(),
    blockProverPrecompile: descriptor.blockProverPrecompile.toLowerCase(),
    proofBuilderUrl: stripTrailingSlash(descriptor.proofBuilderUrl),
    chains: descriptor.chains.map(chain => ({
      id: chain.id,
      chainId: chain.chainId,
      chainKey: chain.chainKey,
      genesisBlock: chain.genesisBlock,
    })),
  });
  return createHash("sha256").update(canonical).digest("hex");
}

function stripTrailingSlash(value: string) {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

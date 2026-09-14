import type { AttestorNetwork } from "./types";
import { getAttestorSettings } from "./registry";

export function networkFacts(network: AttestorNetwork) {
  const item = getAttestorSettings(network);
  return {
    environment: item.environment,
    source: item.sourceChain,
    chainId: item.sourceChainId,
    chainKey: item.chainKey,
    electionMode: item.electionMode,
    release: item.releaseImage,
    cc3: item.cc3RpcUrl,
    decoder: item.decoderContract,
    blockProver: item.blockProverPrecompile,
    chainInfo: item.chainInfoPrecompile,
  };
}

import type { AttestorNetwork } from "./types";
import { getAttestorSettings } from "./registry";

export function precompileMap(network: AttestorNetwork) {
  const item = getAttestorSettings(network);
  return {
    blockProver: item.blockProverPrecompile,
    chainInfo: item.chainInfoPrecompile,
    decoder: item.decoderContract,
  };
}

import type { AttestorNetwork } from "./types";
import { getAttestorSettings } from "./registry";

export function chainInfo(network: AttestorNetwork) {
  const item = getAttestorSettings(network);
  return {
    chainKey: item.chainKey,
    chainId: item.sourceChainId,
    genesis: item.genesisBlock,
    source: item.sourceChain,
  };
}

import type { AttestorNetwork, OperatorConfig } from "./types";
import { getAttestorSettings } from "./registry";

export function operatorSummary(network: AttestorNetwork, config: OperatorConfig) {
  const item = getAttestorSettings(network);
  return {
    name: config.name,
    network,
    sourceChain: item.sourceChain,
    chainKey: item.chainKey,
    release: item.releaseImage,
    cc3: config.cc3Url,
    eth: config.ethUrl,
    p2p: config.p2pPort,
    metrics: config.apiPort,
  };
}

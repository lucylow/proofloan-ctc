import type { AttestorNetwork } from "./types";
import { getAttestorSettings } from "./registry";

export function sourceRpcPolicy(network: AttestorNetwork) {
  const item = getAttestorSettings(network);
  return {
    chainId: item.sourceChainId,
    chainKey: item.chainKey,
    historicalDataRequired: true,
    websocketRequired: true,
    externalProviderRequired: item.externalEthRpcRequired,
    expectedProtocol: "wss/ws",
  };
}

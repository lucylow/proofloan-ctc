import type { AttestorNetwork } from "./types";
import { getAttestorSettings } from "./registry";

export function endpointPolicy(network: AttestorNetwork) {
  const item = getAttestorSettings(network);
  return {
    cc3: { protocol: "websocket", required: true, configured: item.cc3RpcUrl },
    ethereum: { protocol: "websocket", required: true, external: true },
    p2p: { port: item.p2pPort, inboundRequired: true },
    metrics: { port: item.metricsPort, path: "/metrics" },
  };
}

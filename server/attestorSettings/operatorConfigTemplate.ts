import { getAttestorSettings } from "./registry";
import type { AttestorNetwork } from "./types";

export function template(network: AttestorNetwork) {
  const item = getAttestorSettings(network);
  return {
    attestor: {
      name: "my-attestor",
      chain_key: item.chainKey,
      secret: "<secret>",
    },
    api: { port: item.metricsPort },
    p2p: {
      port: item.p2pPort,
      no_mdns: true,
      boot_nodes: ["<creditcoin-team-boot-node>"],
    },
    eth: { url: "<ethereum-mainnet-wss>" },
    cc3: { url: item.cc3RpcUrl },
  };
}

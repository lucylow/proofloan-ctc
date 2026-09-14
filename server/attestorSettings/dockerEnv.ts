import type { AttestorNetwork } from "./types";
import { getAttestorSettings } from "./registry";

export function dockerEnvironment(
  network: AttestorNetwork,
  config: {
    name: string;
    chainKey: number;
    cc3Url: string;
    ethUrl: string;
    apiPort: number;
    p2pPort: number;
  },
) {
  const item = getAttestorSettings(network);
  return {
    ATTESTOR_NAME: config.name,
    ATTESTOR_CHAIN_KEY: String(item.chainKey),
    ATTESTOR_CC3_URL: config.cc3Url,
    ATTESTOR_ETH_URL: config.ethUrl,
    ATTESTOR_API_PORT: String(config.apiPort),
    ATTESTOR_P2P_PORT: String(config.p2pPort),
  };
}

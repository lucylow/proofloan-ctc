import { getAttestorSettings } from "./registry";
import type { AttestorNetwork } from "./types";

export function operatorLinks(network: AttestorNetwork) {
  const item = getAttestorSettings(network);
  return {
    polkadotJs: item.polkadotJsUrl,
    cc3Rpc: item.cc3RpcUrl,
    proofBuilder: item.proofBuilderUrl,
    dashboard: item.dashboardUrl,
  };
}

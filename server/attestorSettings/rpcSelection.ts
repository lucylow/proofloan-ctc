import type { AttestorNetwork } from "./types";
import { getAttestorSettings } from "./registry";

export function chooseCc3Rpc(network: AttestorNetwork, override?: string) {
  return override?.trim() || getAttestorSettings(network).cc3RpcUrl;
}

export function requireExternalEthereumRpc(value?: string) {
  if (!value) throw new Error("Ethereum Mainnet RPC is required for an external Attestor.");
  return value;
}

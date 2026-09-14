import type { AttestorNetwork } from "./types";
import { getAttestorSettings } from "./registry";

export function bootnodeRequirement(network: AttestorNetwork, nodes: string[]) {
  const required = getAttestorSettings(network).productionBootNodesRequired;
  return { required, present: nodes.length > 0, ready: !required || nodes.length > 0 };
}

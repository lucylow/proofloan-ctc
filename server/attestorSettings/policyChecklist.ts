import type { AttestorNetwork, OperatorConfig } from "./types";
import { getAttestorSettings } from "./registry";

export function checklist(network: AttestorNetwork, config: OperatorConfig) {
  const item = getAttestorSettings(network);
  return [
    ["authorized-mode", item.electionMode === "AuthorizedOnly"],
    ["separate-accounts", true],
    ["cc3-ws", config.cc3Url.startsWith("ws")],
    ["eth-ws", config.ethUrl.startsWith("ws")],
    ["p2p", config.p2pPort === item.p2pPort],
    ["boot-node", config.bootNodes.length > 0],
    ["persistent-secret", config.secret.length > 0],
  ] as const;
}

import { getAttestorSettings } from "./registry";
import type { AttestorNetwork, OperatorConfig } from "./types";

export function generateYaml(network: AttestorNetwork, config: OperatorConfig): string {
  const settings = getAttestorSettings(network);
  const boot = config.bootNodes.length
    ? config.bootNodes.map(node => `    - ${quote(node)}`).join("\n")
    : "    []";

  return [
    "attestor:",
    `  name: ${quote(config.name)}`,
    `  chain_key: ${settings.chainKey}`,
    `  secret: ${quote(config.secret)}`,
    ...(config.publicAddress ? [`  public_addr: ${quote(config.publicAddress)}`] : []),
    "api:",
    `  port: ${config.apiPort}`,
    "p2p:",
    `  port: ${config.p2pPort}`,
    `  no_mdns: ${config.noMdns}`,
    "  boot_nodes:",
    boot,
    "eth:",
    `  url: ${quote(config.ethUrl)}`,
    "cc3:",
    `  url: ${quote(config.cc3Url)}`,
    ...(config.logsPath ? [`logs: ${quote(config.logsPath)}`] : []),
  ].join("\n") + "\n";
}

function quote(value: string): string {
  return JSON.stringify(value);
}

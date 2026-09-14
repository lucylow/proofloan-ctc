import { createHash } from "node:crypto";
import { getAttestorSettings } from "./registry";
import type { AttestorNetwork, OperatorConfig, SettingsValidationIssue, SettingsValidationResult } from "./types";

const websocketUrl = (value: string) => /^wss?:\/\//i.test(value);
const isSeed = (value: string) => /^(0x[a-fA-F0-9]{64}|(?:\S+\s+){11,23}\S+)$/.test(value.trim());
const fingerprint = (input: unknown) => createHash("sha256").update(JSON.stringify(input)).digest("hex");

export function validateOperatorConfig(network: AttestorNetwork, config: OperatorConfig): SettingsValidationResult {
  const expected = getAttestorSettings(network);
  const issues: SettingsValidationIssue[] = [];

  if (!config.name.trim()) {
    issues.push({ code: "NAME_REQUIRED", severity: "error", field: "name", message: "Attestor name is required." });
  }
  if (config.chainKey !== expected.chainKey) {
    issues.push({
      code: "CHAIN_KEY_MISMATCH",
      severity: "error",
      field: "chainKey",
      message: `Expected chain key ${expected.chainKey} for ${network}.`,
    });
  }
  if (!isSeed(config.secret)) {
    issues.push({
      code: "SECRET_SHAPE",
      severity: "error",
      field: "secret",
      message: "Secret must be a BIP-39 mnemonic or 32-byte 0x seed.",
    });
  }
  if (!websocketUrl(config.cc3Url)) {
    issues.push({
      code: "CC3_WS_REQUIRED",
      severity: "error",
      field: "cc3Url",
      message: "CC3 endpoint must use ws:// or wss://.",
    });
  }
  if (!websocketUrl(config.ethUrl)) {
    issues.push({
      code: "ETH_WS_REQUIRED",
      severity: "error",
      field: "ethUrl",
      message: "Ethereum endpoint must use ws:// or wss://.",
    });
  }
  if (config.p2pPort !== expected.p2pPort) {
    issues.push({
      code: "P2P_PORT",
      severity: "warning",
      field: "p2pPort",
      message: `Recommended P2P port is ${expected.p2pPort}.`,
    });
  }
  if (config.apiPort !== expected.metricsPort) {
    issues.push({
      code: "API_PORT",
      severity: "info",
      field: "apiPort",
      message: `Reference metrics port is ${expected.metricsPort}.`,
    });
  }
  if (config.bootNodes.length === 0 && expected.productionBootNodesRequired) {
    issues.push({
      code: "BOOTNODE_REQUIRED",
      severity: "warning",
      field: "bootNodes",
      message: "Production operator setup expects a boot node supplied by the Creditcoin team.",
    });
  }
  if (config.publicAddress && !config.publicAddress.includes("/")) {
    issues.push({
      code: "PUBLIC_ADDR_FORMAT",
      severity: "warning",
      field: "publicAddress",
      message: "publicAddress should normally be a reachable libp2p multiaddr or equivalent stable address.",
    });
  }

  return {
    valid: !issues.some(issue => issue.severity === "error"),
    issues,
    fingerprint: fingerprint({ network, expected, config: { ...config, secret: "[redacted]" } }),
  };
}

import { describe, expect, it } from "vitest";
import { operatorConfigSchema } from "@shared/attestorSettings";
import { getAttestorSettings } from "./registry";
import { validateOperatorConfig } from "./validation";
import { generateYaml } from "./configGenerator";
import { assessFreeBalance } from "./balancePolicy";
import { nextActions } from "./lifecycle";
import { reconcileChainState } from "./reconciliation";
import { detectDrift } from "./configurationDrift";
import { secretPolicy } from "./secretPolicy";
import { redactConfig } from "./configRedaction";
import { dockerRunCommand, assertReleaseImage } from "./releasePolicy";
import { publicManifest } from "./serialization";
import { chainKeyExplanation } from "./chainKeyGuard";
import { bootnodeRequirement } from "./bootnodePolicy";
import { template } from "./operatorConfigTemplate";
import type { OperatorConfig } from "./types";

const mnemonic = "one two three four five six seven eight nine ten eleven twelve";

function sampleConfig(network: "cc3-mainnet" | "cc3-testnet", overrides: Partial<OperatorConfig> = {}): OperatorConfig {
  const settings = getAttestorSettings(network);
  return {
    name: "demo",
    chainKey: settings.chainKey,
    secret: mnemonic,
    apiPort: 9100,
    p2pPort: 9000,
    noMdns: true,
    bootNodes: ["/ip4/1.2.3.4/tcp/9000/p2p/demo"],
    ethUrl: "wss://eth.example",
    cc3Url: settings.cc3RpcUrl,
    ...overrides,
  };
}

describe("per-chain Attestor settings", () => {
  it("uses chain key 1 on CC3 mainnet for Ethereum mainnet", () => {
    expect(getAttestorSettings("cc3-mainnet").chainKey).toBe(1);
  });

  it("uses chain key 3 on CC3 testnet for Ethereum mainnet", () => {
    expect(getAttestorSettings("cc3-testnet").chainKey).toBe(3);
  });

  it("keeps websocket endpoints explicit", () => {
    const item = getAttestorSettings("cc3-testnet");
    expect(item.cc3RpcUrl.startsWith("wss://")).toBe(true);
    expect(item.externalEthRpcRequired).toBe(true);
  });

  it("pins the documented release images", () => {
    expect(getAttestorSettings("cc3-mainnet").releaseImage).toBe("gluwa/creditcoin3:3.128.0-mainnet");
    expect(getAttestorSettings("cc3-testnet").releaseImage).toBe("gluwa/creditcoin3:3.128.0-testnet");
  });

  it("rejects a cross-environment chain key mismatch", () => {
    const result = validateOperatorConfig("cc3-mainnet", sampleConfig("cc3-mainnet", { chainKey: 3 }));
    expect(result.valid).toBe(false);
    expect(result.issues.some(issue => issue.code === "CHAIN_KEY_MISMATCH")).toBe(true);
  });

  it("generates config using the authoritative chain key", () => {
    const yaml = generateYaml("cc3-testnet", sampleConfig("cc3-testnet"));
    expect(yaml).toContain("chain_key: 3");
    expect(yaml).toContain("no_mdns: true");
  });

  it("recognizes the 1 CTC hard minimum and 10 CTC recommended buffer", () => {
    expect(assessFreeBalance("cc3-mainnet", 0.9).sufficient).toBe(false);
    expect(assessFreeBalance("cc3-mainnet", 5).recommended).toBe(false);
    expect(assessFreeBalance("cc3-mainnet", 10).recommended).toBe(true);
  });

  it("requires authorization before registration in AuthorizedOnly mode", () => {
    expect(nextActions("cc3-mainnet", "None", false)).toEqual(["authorize"]);
    expect(nextActions("cc3-mainnet", "Idle", true)).toEqual(["attest", "wait-election"]);
  });

  it("reconciles observed chain state", () => {
    expect(reconcileChainState("cc3-testnet", { chainKey: 3, sourceChainId: 1, genesisBlock: 0 }).consistent).toBe(true);
    expect(reconcileChainState("cc3-testnet", { chainKey: 1 }).consistent).toBe(false);
  });

  it("detects configuration drift without inventing boot nodes", () => {
    const testnet = getAttestorSettings("cc3-testnet");
    expect(detectDrift("cc3-testnet", {
      chainKey: 3,
      releaseImage: testnet.releaseImage,
      cc3Url: testnet.cc3RpcUrl,
    })).toEqual({ chainKey: false, release: false, cc3: false });
    expect(template("cc3-mainnet").p2p.boot_nodes).toEqual(["<creditcoin-team-boot-node>"]);
    expect(bootnodeRequirement("cc3-mainnet", []).present).toBe(false);
  });

  it("redacts secrets and accepts mnemonic or hex seeds", () => {
    expect(secretPolicy(mnemonic).kind).toBe("mnemonic");
    expect(redactConfig({ secret: mnemonic, name: "demo" }).secret).toBe("[redacted]");
  });

  it("emits a docker command pinned to the official image", () => {
    const command = dockerRunCommand("cc3-mainnet", {
      configPath: "./config.yaml",
      logsPath: "./logs",
      dataPath: "./data",
    });
    expect(command).toContain("gluwa/creditcoin3:3.128.0-mainnet");
    expect(() => assertReleaseImage("cc3-testnet", "gluwa/creditcoin3:wrong")).toThrow(/Unsupported Attestor image/);
  });

  it("accepts operator config through the shared schema", () => {
    const parsed = operatorConfigSchema.safeParse(sampleConfig("cc3-testnet"));
    expect(parsed.success).toBe(true);
  });

  it("keeps public manifests free of operator secrets", () => {
    const manifest = publicManifest("cc3-mainnet");
    expect(manifest).not.toHaveProperty("secret");
    expect(chainKeyExplanation("cc3-mainnet")).toContain("chainKey 1");
  });
});

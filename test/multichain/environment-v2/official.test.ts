import { describe, expect, it } from "vitest";
import { getOfficialBinding } from "@shared/multichain";
import { getPublicChainCatalog } from "../../../server/multichain/catalog";
import {
  getPublicEnvironmentSnapshot,
  resetEnvironmentCache,
} from "../../../server/multichain/environment";
import {
  OFFICIAL_ATTESTCOIN_ENVIRONMENTS,
  allEnvironmentDiagnostics,
  assertAllOfficialEnvironmentsValid,
  assertOfficialChainSelection,
  assertOperationalRegistryAligned,
  assertValidOfficialEnvironment,
  buildPublicAttestcoinManifest,
  chainCapabilities,
  compareChainToEnvironment,
  compareEnvironments,
  documentedChainKey,
  environmentCapabilities,
  environmentDiagnostics,
  environmentFingerprint,
  findOfficialChain,
  getOfficialEnvironment,
  isOfficialEnvironment,
  isOfficiallyEnabledChain,
  officialRegistry,
  operationalRegistryAlignmentIssues,
  resolveByChain,
  resolveFromQueryParam,
  resolveFromWalletChainId,
  resolveOfficialEnvironment,
  validateOfficialEnvironment,
} from "../../../server/multichain/environment-v2";
import { requireOfficialChainKey } from "../../../server/multichain/registry";
import { assertRegistryIntegrity } from "../../../server/multichain/validation";
import { classifyProofRequest } from "../../../server/multichain/requestPolicy";

describe("Attestcoin environment-v2 official registry", () => {
  it("encodes the documented CC3 Testnet and CC3 Mainnet mappings", () => {
    const testnet = getOfficialEnvironment("cc3-testnet");
    const mainnet = getOfficialEnvironment("cc3-mainnet");

    expect(testnet.decoderContract).toBe("0x731c345d79Fb8BbDC541f9DF3b6317585F849F9f");
    expect(mainnet.decoderContract).toBe("0x9D094C9f22B10FCf842c2fC6A0981630A4F94B5C");
    expect(testnet.proofBuilderUrl).toBe(
      "https://proof-gen-api.cc3-testnet.creditcoin.network/",
    );
    expect(mainnet.proofBuilderUrl).toBe(
      "https://proofbuilder.cc3-mainnet-usc.creditcoin.network/",
    );
    expect(testnet.blockProverPrecompile.toLowerCase()).toBe(
      "0x0000000000000000000000000000000000000fd2",
    );
    expect(mainnet.chainInfoPrecompile.toLowerCase()).toBe(
      "0x0000000000000000000000000000000000000fd3",
    );

    expect(documentedChainKey("cc3-testnet", "ethereum-sepolia")).toBe(1);
    expect(documentedChainKey("cc3-testnet", "ethereum-mainnet")).toBe(3);
    expect(documentedChainKey("cc3-mainnet", "ethereum-mainnet")).toBe(1);
    expect(findOfficialChain("cc3-testnet", "Ethereum Sepolia")?.genesisBlock).toBe(0);
    expect(findOfficialChain("cc3-mainnet", "Ethereum Mainnet")?.genesisBlock).toBe(0);
  });

  it("refuses to invent official mappings for unsupported chains", () => {
    expect(findOfficialChain("cc3-testnet", "polygon-amoy")).toBeUndefined();
    expect(findOfficialChain("cc3-mainnet", "polygon-amoy")).toBeUndefined();
    expect(findOfficialChain("cc3-mainnet", "ethereum-sepolia")).toBeUndefined();
    expect(findOfficialChain("cc3-mainnet", "11155111")).toBeUndefined();
    expect(isOfficiallyEnabledChain("cc3-testnet", "Polygon Amoy")).toBe(false);
    expect(getOfficialBinding("cc3-mainnet", "Ethereum Sepolia")).toBeUndefined();
    expect(compareChainToEnvironment("polygon-amoy", "cc3-testnet").compatible).toBe(false);
    expect(() => officialRegistry.assertChain("cc3-testnet", "polygon-amoy")).toThrow(
      /Unsupported chain\/environment pair/,
    );
    expect(() =>
      assertOfficialChainSelection({ environment: "cc3-mainnet", chain: "ethereum-sepolia" }),
    ).toThrow(/not officially enabled/);
  });

  it("validates precompiles, HTTPS endpoints, and documented genesis blocks", () => {
    expect(validateOfficialEnvironment("cc3-testnet")).toEqual([]);
    expect(validateOfficialEnvironment("cc3-mainnet")).toEqual([]);
    expect(() => assertValidOfficialEnvironment("cc3-testnet")).not.toThrow();
    expect(() => assertAllOfficialEnvironmentsValid()).not.toThrow();
    expect(validateOfficialEnvironment("devnet")[0]).toMatch(/Unsupported official Attestcoin environment/);
  });

  it("resolves environments explicitly, from env, and by chain without inventing support", () => {
    expect(resolveOfficialEnvironment({ explicit: "cc3-mainnet" })).toEqual({
      environment: "cc3-mainnet",
      reason: "explicit",
      warnings: [],
    });
    expect(resolveOfficialEnvironment({ env: "cc3-testnet" }).reason).toBe("env");
    expect(resolveOfficialEnvironment({ explicit: "devnet" })).toMatchObject({
      environment: "cc3-testnet",
      reason: "unsupported",
    });
    expect(resolveOfficialEnvironment().reason).toBe("default");
    expect(resolveFromQueryParam("cc3-mainnet").reason).toBe("query");
    expect(resolveFromWalletChainId(11155111)).toMatchObject({
      environment: "cc3-testnet",
      reason: "wallet",
    });

    expect(resolveByChain({ chain: "sepolia" })).toEqual({
      environment: "cc3-testnet",
      chainId: "ethereum-sepolia",
      warnings: [],
    });
    expect(resolveByChain({ chain: "Ethereum Mainnet" }).warnings[0]).toMatch(
      /multiple environments/,
    );
    expect(resolveByChain({ environment: "cc3-mainnet", chain: "polygon-amoy" }).warnings[0]).toMatch(
      /not officially enabled/,
    );
    expect(
      assertOfficialChainSelection({ environment: "cc3-testnet", chain: "11155111" }),
    ).toEqual({
      environment: "cc3-testnet",
      chainId: "ethereum-sepolia",
      chainKey: 1,
    });
  });

  it("exposes capability detection for environments and official chains only", () => {
    const testnet = environmentCapabilities("cc3-testnet");
    expect(testnet["proof-builder"]).toBe(true);
    expect(testnet.decoder).toBe(true);
    expect(testnet["block-prover"]).toBe(true);
    expect(testnet["chain-info"]).toBe(true);
    expect(testnet.sdk).toBe(true);

    expect(chainCapabilities("cc3-testnet", "ethereum-sepolia")).toMatchObject({
      exists: true,
      official: true,
      attestcoin: true,
      proof: true,
    });
    expect(chainCapabilities("cc3-mainnet", "ethereum-sepolia").exists).toBe(false);
    expect(chainCapabilities("cc3-testnet", "polygon-amoy").proof).toBe(false);
  });

  it("builds a secret-free public manifest and deterministic fingerprints", () => {
    const manifest = buildPublicAttestcoinManifest();
    const serialized = JSON.stringify(manifest);
    expect(serialized).not.toMatch(/rpcUrl|privateKey|apiKey|secret|mnemonic/i);
    expect(manifest).toHaveLength(2);
    expect(manifest.find(item => item.id === "cc3-testnet")?.chains).toHaveLength(2);
    expect(manifest.find(item => item.id === "cc3-mainnet")?.chains).toHaveLength(1);

    const first = environmentFingerprint("cc3-testnet");
    const second = environmentFingerprint("cc3-testnet");
    expect(first).toBe(second);
    expect(first).toHaveLength(64);
    expect(environmentFingerprint("cc3-mainnet")).not.toBe(first);
  });

  it("reports diagnostics and keeps the official layer aligned with the operational registry", () => {
    expect(environmentDiagnostics("cc3-testnet").valid).toBe(true);
    expect(allEnvironmentDiagnostics().every(item => item.valid)).toBe(true);
    expect(operationalRegistryAlignmentIssues()).toEqual([]);
    expect(() => assertOperationalRegistryAligned()).not.toThrow();
    expect(() => assertRegistryIntegrity()).not.toThrow();
    expect(isOfficialEnvironment("cc3-mainnet")).toBe(true);
    expect(Object.keys(OFFICIAL_ATTESTCOIN_ENVIRONMENTS)).toEqual([
      "cc3-testnet",
      "cc3-mainnet",
    ]);
    expect(compareEnvironments("cc3-testnet", "cc3-mainnet").reasons).toContain(
      "Enabled chain sets differ",
    );
  });

  it("plugs into live-proof, catalog, and environment snapshot surfaces", () => {
    process.env.ATTESTCOIN_ENVIRONMENT = "cc3-testnet";
    resetEnvironmentCache();

    expect(requireOfficialChainKey("Ethereum Sepolia", "cc3-testnet")).toBe(1);
    expect(requireOfficialChainKey("Ethereum Mainnet", "cc3-testnet")).toBe(3);
    expect(requireOfficialChainKey("Ethereum Mainnet", "cc3-mainnet")).toBe(1);
    expect(() => requireOfficialChainKey("Polygon Amoy", "cc3-testnet")).toThrow(
      /not listed as an official Attestcoin-enabled chain/,
    );

    const live = classifyProofRequest({
      sourceChain: "Ethereum Sepolia",
      intent: "live",
      txHash: `0x${"ab".repeat(32)}`,
    });
    expect(live).toMatchObject({ kind: "live", chainKey: 1, environment: "cc3-testnet" });

    const rejected = classifyProofRequest({
      sourceChain: "Polygon Amoy",
      intent: "live",
      txHash: `0x${"cd".repeat(32)}`,
    });
    expect(rejected.kind).toBe("reject");

    const catalog = getPublicChainCatalog("cc3-testnet");
    expect(catalog.officialEnvironment.fingerprint).toBe(environmentFingerprint("cc3-testnet"));
    expect(catalog.officialEnvironment.manifest?.decoderContract).toBe(
      "0x731c345d79Fb8BbDC541f9DF3b6317585F849F9f",
    );
    expect(
      catalog.officialEnvironment.allEnvironments.find(item => item.environment === "cc3-mainnet")
        ?.manifest?.chains,
    ).toEqual([
      expect.objectContaining({ id: "ethereum-mainnet", chainKey: 1 }),
    ]);

    const snapshot = getPublicEnvironmentSnapshot({
      ATTESTCOIN_ENVIRONMENT: "cc3-mainnet",
    });
    expect(snapshot.fingerprint).toBe(environmentFingerprint("cc3-mainnet"));
    expect(snapshot.officialManifest?.chains.map(chain => chain.id)).toEqual([
      "ethereum-mainnet",
    ]);
  });
});

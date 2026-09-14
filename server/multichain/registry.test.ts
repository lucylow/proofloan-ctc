import { describe, expect, it } from "vitest";
import {
  MULTICHAIN_REGISTRY,
  chainCapability,
  getOfficialBinding,
  registryIntegrityIssues,
} from "@shared/multichain";
import { assertRegistryIntegrity } from "./validation";
import { resolveSourceChain } from "./registry";
import { resetEnvironmentCache } from "./environment";

describe("multi-chain registry", () => {
  it("encodes official Attestcoin chainkeys from current documentation", () => {
    expect(getOfficialBinding("cc3-testnet", "Ethereum Sepolia")?.chainKey).toBe(1);
    expect(getOfficialBinding("cc3-testnet", "Ethereum Mainnet")?.chainKey).toBe(3);
    expect(getOfficialBinding("cc3-mainnet", "Ethereum Mainnet")?.chainKey).toBe(1);
    expect(getOfficialBinding("cc3-testnet", "Polygon Amoy")).toBeUndefined();
    expect(getOfficialBinding("cc3-mainnet", "Polygon Amoy")).toBeUndefined();
    expect(getOfficialBinding("cc3-mainnet", "Ethereum Sepolia")).toBeUndefined();
  });

  it("keeps Polygon Amoy experimental and without an official chainkey", () => {
    const capability = chainCapability("cc3-testnet", "Polygon Amoy");
    expect(capability.support).toBe("experimental");
    expect(capability.liveProof).toBe(false);
    expect(capability.chainKey).toBeNull();
    expect(capability.preview).toBe(true);
  });

  it("uses distinct Proof Builder endpoints and decoder contracts per environment", () => {
    const testnet = MULTICHAIN_REGISTRY.environments["cc3-testnet"];
    const mainnet = MULTICHAIN_REGISTRY.environments["cc3-mainnet"];
    expect(testnet.proofBuilderUrl).not.toBe(mainnet.proofBuilderUrl);
    expect(testnet.decoderContract).not.toBe(mainnet.decoderContract);
    expect(testnet.decoderContract).toBe("0x731c345d79Fb8BbDC541f9DF3b6317585F849F9f");
    expect(mainnet.decoderContract).toBe("0x9D094C9f22B10FCf842c2fC6A0981630A4F94B5C");
  });

  it("passes registry integrity checks", () => {
    expect(registryIntegrityIssues()).toEqual([]);
    expect(assertRegistryIntegrity()).toBe(true);
  });

  it("resolves Sepolia live-proof configuration from the registry instead of hard-coded branches", () => {
    process.env.ATTESTCOIN_ENVIRONMENT = "cc3-testnet";
    resetEnvironmentCache();
    const sepolia = resolveSourceChain("Ethereum Sepolia");
    expect(sepolia.chainKey).toBe(1);
    expect(sepolia.liveProofEnabled).toBe(true);
    expect(sepolia.confirmationDepth).toBe(32);
    expect(sepolia.rpcUrls.length).toBeGreaterThan(0);
  });
});

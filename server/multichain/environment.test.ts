import { afterEach, describe, expect, it } from "vitest";
import {
  getPublicEnvironmentSnapshot,
  resetEnvironmentCache,
  resolveAttestcoinEnvironment,
} from "./environment";
import { parseEnvironmentId } from "./validation";
import { compareChainToEnvironment, compareEnvironments } from "./environment-v2/compatibility";
import { findOfficialChain } from "./environment-v2/official";
import { assertOfficialChainSelection } from "./environment-v2/selection";

describe("Attestcoin environment resolution", () => {
  afterEach(() => {
    resetEnvironmentCache();
  });

  it("defaults to CC3 Testnet for the hackathon demo", () => {
    const resolved = resolveAttestcoinEnvironment({});
    expect(resolved.id).toBe("cc3-testnet");
    expect(resolved.networkKind).toBe("testnet");
    expect(resolved.proofBuilderUrl).toContain("cc3-testnet");
  });

  it("accepts cc3-mainnet only as an explicit environment selection", () => {
    const resolved = resolveAttestcoinEnvironment({
      ATTESTCOIN_ENVIRONMENT: "cc3-mainnet",
    });
    expect(resolved.id).toBe("cc3-mainnet");
    expect(resolved.evmChainId).toBe(102030);
    expect(resolved.explorerUrl).toContain("creditcoin.blockscout.com");
    expect(resolved.decoderContract).toBe(
      "0x9D094C9f22B10FCf842c2fC6A0981630A4F94B5C",
    );
  });

  it("honors RPC and proof-builder overrides", () => {
    const resolved = resolveAttestcoinEnvironment({
      CREDITCOIN_RPC_URL: "https://rpc.example.test",
      CREDITCOIN_PROOF_BUILDER_URL: "https://prover.example.test",
    });
    expect(resolved.creditcoinRpcUrl).toBe("https://rpc.example.test");
    expect(resolved.proofBuilderUrl).toBe("https://prover.example.test");
  });

  it("rejects unknown environments", () => {
    expect(() => parseEnvironmentId("devnet")).toThrow(/Unknown Attestcoin environment/);
  });

  it("fails closed for unknown official environments instead of throwing from lookup helpers", () => {
    expect(findOfficialChain("devnet", "ethereum-sepolia")).toBeUndefined();
    expect(compareChainToEnvironment("ethereum-sepolia", "devnet").compatible).toBe(false);
    expect(compareEnvironments("devnet", "cc3-testnet").compatible).toBe(false);
    try {
      assertOfficialChainSelection({ environment: "cc3-testnet", chain: "polygon-amoy" });
      throw new Error("expected unsupported chain");
    } catch (error) {
      expect(error).toMatchObject({ name: "AttestcoinError", kind: "UNSUPPORTED_CHAIN" });
    }
  });

  it("exposes a public snapshot with capability rows", () => {
    const snapshot = getPublicEnvironmentSnapshot({
      ATTESTCOIN_ENVIRONMENT: "cc3-testnet",
    });
    expect(snapshot.environment).toBe("cc3-testnet");
    expect(snapshot.capabilities.some(row => row.name === "Ethereum Sepolia" && row.liveProof)).toBe(true);
    expect(snapshot.capabilities.some(row => row.name === "Polygon Amoy" && !row.liveProof)).toBe(true);
  });
});

import { Wallet } from "ethers";
import { afterEach, describe, expect, it } from "vitest";
import {
  CREDITCOIN_CHAIN_IDS,
  CREDITCOIN_EVM_VERSION,
  rpcUrlConflictsWithEnvironment,
  registryIntegrityIssues,
} from "@shared/multichain";
import { compileProofLoanContracts } from "./compile";
import { assertGuardianAddress, ZERO_ADDRESS } from "./contracts";
import { DeployError } from "./errors";
import { assertDeployGuards, buildDeployRequest, extractPrivateKey } from "./guards";
import { CREDITCOIN_DEPLOY_NETWORKS, getDeployNetwork, parseDeployNetworkId } from "./networks";
import { planDeployments } from "./plan";
import {
  resetEnvironmentCache,
  resolveAttestcoinEnvironment,
} from "../multichain/environment";

describe("Creditcoin testnet/mainnet deployment", () => {
  afterEach(() => {
    resetEnvironmentCache();
  });

  it("keeps documented Creditcoin chain IDs and shanghai compilation", () => {
    expect(CREDITCOIN_CHAIN_IDS["cc3-testnet"]).toBe(102031);
    expect(CREDITCOIN_CHAIN_IDS["cc3-mainnet"]).toBe(102030);
    expect(CREDITCOIN_DEPLOY_NETWORKS["cc3-testnet"].evmChainId).toBe(102031);
    expect(CREDITCOIN_DEPLOY_NETWORKS["cc3-mainnet"].evmChainId).toBe(102030);
    expect(CREDITCOIN_DEPLOY_NETWORKS["cc3-testnet"].evmVersion).toBe(CREDITCOIN_EVM_VERSION);
    expect(CREDITCOIN_DEPLOY_NETWORKS["cc3-mainnet"].requiresMainnetConfirmation).toBe(true);
    expect(registryIntegrityIssues()).toEqual([]);
  });

  it("parses Creditcoin network aliases used by Hardhat/Foundry docs", () => {
    expect(parseDeployNetworkId("testnet")).toBe("cc3-testnet");
    expect(parseDeployNetworkId("creditcoin_mainnet")).toBe("cc3-mainnet");
    expect(getDeployNetwork("cc3-mainnet").explorerUrl).toContain("blockscout");
    expect(() => parseDeployNetworkId("devnet")).toThrow(DeployError);
  });

  it("rejects a testnet RPC when targeting mainnet and the reverse", () => {
    expect(
      rpcUrlConflictsWithEnvironment(
        "https://rpc.cc3-testnet.creditcoin.network",
        "cc3-mainnet",
      ),
    ).toMatch(/testnet/);
    expect(
      rpcUrlConflictsWithEnvironment(
        "https://rpc.cc3-mainnet.creditcoin.network",
        "cc3-testnet",
      ),
    ).toMatch(/mainnet/);
    expect(
      rpcUrlConflictsWithEnvironment(
        "https://rpc.cc3-testnet.creditcoin.network",
        "cc3-testnet",
      ),
    ).toBeUndefined();
  });

  it("does not let a leftover testnet CREDITCOIN_RPC_URL hijack mainnet", () => {
    const resolved = resolveAttestcoinEnvironment({
      ATTESTCOIN_ENVIRONMENT: "cc3-mainnet",
      CREDITCOIN_RPC_URL: "https://rpc.cc3-testnet.creditcoin.network",
    });
    expect(resolved.id).toBe("cc3-mainnet");
    expect(resolved.evmChainId).toBe(102030);
    expect(resolved.creditcoinRpcUrl).toContain("mainnet");
    expect(resolved.warnings.some(item => /testnet/.test(item))).toBe(true);
  });

  it("honors explicit per-network RPC URLs", () => {
    const resolved = resolveAttestcoinEnvironment({
      ATTESTCOIN_ENVIRONMENT: "cc3-mainnet",
      CREDITCOIN_MAINNET_RPC_URL: "https://mainnet3.creditcoin.network",
      CREDITCOIN_RPC_URL: "https://rpc.cc3-testnet.creditcoin.network",
    });
    expect(resolved.creditcoinRpcUrl).toBe("https://mainnet3.creditcoin.network");
  });

  it("refuses a mainnet-specific RPC that actually points at testnet", () => {
    expect(() =>
      resolveAttestcoinEnvironment({
        ATTESTCOIN_ENVIRONMENT: "cc3-mainnet",
        CREDITCOIN_MAINNET_RPC_URL: "https://rpc.cc3-testnet.creditcoin.network",
      }),
    ).toThrow(/testnet/);
  });

  it("blocks a mainnet broadcast without an explicit confirmation", () => {
    const request = buildDeployRequest(CREDITCOIN_DEPLOY_NETWORKS["cc3-mainnet"], {
      mode: "deploy",
      broadcast: true,
      env: {
        CREDITCOIN_DEPLOYER_PRIVATE_KEY:
          "0x1111111111111111111111111111111111111111111111111111111111111111",
      },
    });
    expect(() => assertDeployGuards(request)).toThrow(/CONFIRM_MAINNET/);
  });

  it("blocks a mainnet broadcast while demo mode is on", () => {
    const request = buildDeployRequest(CREDITCOIN_DEPLOY_NETWORKS["cc3-mainnet"], {
      mode: "deploy",
      broadcast: true,
      env: {
        CONFIRM_MAINNET: "yes",
        PROOFLOAN_DEMO_MODE: "true",
        CREDITCOIN_DEPLOYER_PRIVATE_KEY:
          "0x1111111111111111111111111111111111111111111111111111111111111111",
      },
    });
    expect(() => assertDeployGuards(request)).toThrow(/DEMO_MODE/);
  });

  it("allows a confirmed mainnet broadcast when demo mode is off", () => {
    const request = buildDeployRequest(CREDITCOIN_DEPLOY_NETWORKS["cc3-mainnet"], {
      mode: "deploy",
      broadcast: true,
      env: {
        CONFIRM_MAINNET: "yes",
        CREDITCOIN_DEPLOYER_PRIVATE_KEY:
          "0x1111111111111111111111111111111111111111111111111111111111111111",
      },
    });
    expect(() => assertDeployGuards(request)).not.toThrow();
  });

  it("rejects malformed private keys and a zero guardian", () => {
    expect(() =>
      extractPrivateKey({ CREDITCOIN_DEPLOYER_PRIVATE_KEY: "0x1234" }),
    ).toThrow(DeployError);
    expect(() => assertGuardianAddress(ZERO_ADDRESS)).toThrow(/zero address/);
  });

  it("compiles ProofLoan contracts for Creditcoin shanghai and plans both networks", () => {
    const compiled = compileProofLoanContracts();
    expect(compiled.map(item => item.name)).toEqual([
      "ProofLoanAttestcoinReader",
      "ProofLoanReadabilityASC",
      "ProofLoanGovernor",
    ]);
    for (const contract of compiled) {
      expect(contract.evmVersion).toBe("shanghai");
      expect(contract.bytecode.startsWith("0x")).toBe(true);
      expect(contract.bytecode.length).toBeGreaterThan(20);
    }

    const deployer = new Wallet(
      "0x1111111111111111111111111111111111111111111111111111111111111111",
    ).address;
    for (const networkId of ["cc3-testnet", "cc3-mainnet"] as const) {
      const plan = planDeployments(CREDITCOIN_DEPLOY_NETWORKS[networkId], compiled, {
        deployer,
      });
      expect(plan.contracts).toHaveLength(3);
      const governor = plan.contracts.find(item => item.name === "ProofLoanGovernor");
      expect(governor?.constructorArgs[0]).toBe(deployer);
      expect(governor?.initCode.endsWith(deployer.slice(2).toLowerCase())).toBe(true);
      expect(governor?.initCode.length).toBeGreaterThan(
        compiled.find(item => item.name === "ProofLoanGovernor")!.bytecode.length,
      );
    }
  });
});

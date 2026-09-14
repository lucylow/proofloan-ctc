import { Interface, getAddress } from "ethers";
import {
  PROOFLOAN_DEPLOY_CONTRACTS,
  assertGuardianAddress,
  type ProofLoanDeployContractName,
} from "./contracts";
import type { CompiledContract } from "./compile";
import { DeployError } from "./errors";
import type { CreditcoinDeployNetwork } from "./networks";

export type PlannedDeployment = {
  name: ProofLoanDeployContractName;
  source: string;
  constructorArgs: string[];
  initCode: string;
  abi: unknown[];
  bytecode: string;
  explorerPreview: string;
};

export type DeploymentPlan = {
  network: CreditcoinDeployNetwork;
  compiler: string;
  evmVersion: string;
  contracts: PlannedDeployment[];
};

function encodeConstructor(
  compiled: CompiledContract,
  args: string[],
): string {
  if (args.length === 0) return compiled.bytecode;
  const encodedArgs = new Interface(compiled.abi as never).encodeDeploy(args);
  if (!encodedArgs.startsWith("0x") || encodedArgs === "0x") {
    throw new DeployError(
      "COMPILER",
      `${compiled.name} constructor arguments did not encode.`,
    );
  }
  return `${compiled.bytecode}${encodedArgs.slice(2)}`;
}

export function planDeployments(
  network: CreditcoinDeployNetwork,
  compiled: CompiledContract[],
  options: { guardian?: string; deployer?: string } = {},
): DeploymentPlan {
  const guardianInput = options.guardian || options.deployer;
  if (!guardianInput) {
    throw new DeployError(
      "CONFIG",
      "ProofLoanGovernor needs a guardian address. Set CREDITCOIN_DEPLOY_GUARDIAN or use the deployer address.",
    );
  }
  const guardian = assertGuardianAddress(guardianInput);

  const byName = new Map(compiled.map(item => [item.name, item]));
  const contracts = PROOFLOAN_DEPLOY_CONTRACTS.map(spec => {
    const compiledContract = byName.get(spec.name);
    if (!compiledContract) {
      throw new DeployError("COMPILER", `Missing compiled artifact for ${spec.name}.`);
    }
    const constructorArgs =
      spec.name === "ProofLoanGovernor" ? [getAddress(guardian)] : [];
    const initCode = encodeConstructor(compiledContract, constructorArgs);
    return {
      name: spec.name,
      source: spec.source,
      constructorArgs,
      initCode,
      abi: compiledContract.abi,
      bytecode: compiledContract.bytecode,
      explorerPreview: network.explorerUrl,
    };
  });

  return {
    network,
    compiler: compiled[0]?.compiler ?? "solc",
    evmVersion: compiled[0]?.evmVersion ?? network.evmVersion,
    contracts,
  };
}

export function checksumAddress(value: string) {
  return getAddress(value);
}

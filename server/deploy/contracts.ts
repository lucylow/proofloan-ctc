import path from "node:path";
import { fileURLToPath } from "node:url";
import { DeployError } from "./errors";

const moduleDir = path.dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = path.resolve(moduleDir, "../..");
export const CONTRACTS_ROOT = path.join(REPO_ROOT, "contracts");
export const DEPLOYMENTS_DIR = path.join(REPO_ROOT, "deployments");

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export const PROOFLOAN_DEPLOY_CONTRACTS = [
  {
    name: "ProofLoanAttestcoinReader",
    source: "ProofLoanAttestcoinReader.sol",
    constructorArgs: [] as const,
    envAddressKey: "PROOFLOAN_READER_ADDRESS",
  },
  {
    name: "ProofLoanReadabilityASC",
    source: "readability/ProofLoanReadabilityASC.sol",
    constructorArgs: [] as const,
    envAddressKey: "PROOFLOAN_READABILITY_ASC_ADDRESS",
  },
  {
    name: "ProofLoanGovernor",
    source: "dao/ProofLoanGovernor.sol",
    constructorArgs: ["guardian"] as const,
    envAddressKey: "PROOFLOAN_GOVERNOR_ADDRESS",
  },
] as const;

export type ProofLoanDeployContractName =
  (typeof PROOFLOAN_DEPLOY_CONTRACTS)[number]["name"];

export function contractSourcePath(source: string) {
  return path.join(CONTRACTS_ROOT, source);
}

export function assertGuardianAddress(value: string): string {
  const trimmed = value.trim();
  if (!/^0x[0-9a-fA-F]{40}$/.test(trimmed)) {
    throw new DeployError(
      "CONFIG",
      `Guardian must be a 20-byte hex address, received '${value}'.`,
    );
  }
  if (trimmed.toLowerCase() === ZERO_ADDRESS) {
    throw new DeployError(
      "CONFIG",
      "ProofLoanGovernor guardian cannot be the zero address.",
    );
  }
  return trimmed;
}

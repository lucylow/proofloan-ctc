import fs from "node:fs";
import path from "node:path";
import { DEPLOYMENTS_DIR } from "./contracts";
import { DeployError } from "./errors";
import type { CreditcoinDeployNetworkId } from "./networks";
import type { ProofLoanDeployContractName } from "./contracts";

export type DeployedContractArtifact = {
  name: ProofLoanDeployContractName;
  address: string;
  txHash?: string;
  explorerUrl?: string;
  constructorArgs: string[];
};

export type DeploymentArtifact = {
  network: CreditcoinDeployNetworkId;
  evmChainId: number;
  deployedAt: string;
  deployer?: string;
  compiler: string;
  evmVersion: string;
  contracts: DeployedContractArtifact[];
};

export function artifactPath(network: CreditcoinDeployNetworkId) {
  return path.join(DEPLOYMENTS_DIR, `${network}.json`);
}

export function readDeploymentArtifact(
  network: CreditcoinDeployNetworkId,
): DeploymentArtifact | undefined {
  const file = artifactPath(network);
  if (!fs.existsSync(file)) return undefined;
  try {
    return JSON.parse(fs.readFileSync(file, "utf8")) as DeploymentArtifact;
  } catch (error) {
    throw new DeployError(
      "ARTIFACT",
      `Failed to read deployment artifact ${file}.`,
      { cause: error },
    );
  }
}

export function writeDeploymentArtifact(artifact: DeploymentArtifact) {
  fs.mkdirSync(DEPLOYMENTS_DIR, { recursive: true });
  const file = artifactPath(artifact.network);
  fs.writeFileSync(file, `${JSON.stringify(artifact, null, 2)}\n`, "utf8");
  return file;
}

export function contractAddressFromArtifact(
  artifact: DeploymentArtifact | undefined,
  name: ProofLoanDeployContractName,
): string | undefined {
  return artifact?.contracts.find(item => item.name === name)?.address;
}

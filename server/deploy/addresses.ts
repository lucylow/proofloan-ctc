import { PROOFLOAN_DEPLOY_CONTRACTS, type ProofLoanDeployContractName } from "./contracts";
import { readDeploymentArtifact } from "./artifacts";
import type { AttestcoinEnvironmentId } from "@shared/multichain";

export type DeployedProofLoanContracts = Partial<
  Record<ProofLoanDeployContractName, string>
>;

function readAddress(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;
  if (!/^0x[0-9a-fA-F]{40}$/.test(trimmed)) return undefined;
  return trimmed;
}

export function resolveDeployedProofLoanContracts(
  environment: AttestcoinEnvironmentId,
  env: Record<string, string | undefined> = process.env,
): DeployedProofLoanContracts {
  let artifact;
  try {
    artifact = readDeploymentArtifact(environment);
  } catch {
    artifact = undefined;
  }
  const resolved: DeployedProofLoanContracts = {};
  for (const spec of PROOFLOAN_DEPLOY_CONTRACTS) {
    const fromEnv = readAddress(env[spec.envAddressKey]);
    const fromArtifact = readAddress(
      artifact?.contracts.find(item => item.name === spec.name)?.address,
    );
    const address = fromEnv ?? fromArtifact;
    if (address) resolved[spec.name] = address;
  }
  return resolved;
}

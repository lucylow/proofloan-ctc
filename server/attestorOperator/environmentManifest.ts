import type { OperatorEnvironment, OperatorPolicy } from "./types";
import { officialOperatorPolicy } from "./policy";
import { getAttestorSettings } from "@shared/attestorSettings";

export type OperatorEnvironmentManifest = {
  environment: OperatorEnvironment;
  chainKey: number;
  cc3Rpc: string | undefined;
  attestorBootNodesRequired: boolean;
  supportedSourceChain: string;
  electionMode: OperatorPolicy["electionMode"];
  proofBuilderRequired: boolean;
  blockProverAddress: string;
  chainInfoAddress: string;
};

export function buildEnvironmentManifest(environment: OperatorEnvironment, cc3Rpc?: string): OperatorEnvironmentManifest {
  const policy = officialOperatorPolicy(environment);
  const settings = getAttestorSettings(environment);
  return {
    environment,
    chainKey: policy.chainKey,
    cc3Rpc: cc3Rpc ?? settings.cc3RpcUrl,
    attestorBootNodesRequired: settings.productionBootNodesRequired,
    supportedSourceChain: settings.sourceChain,
    electionMode: policy.electionMode,
    proofBuilderRequired: true,
    blockProverAddress: settings.blockProverPrecompile,
    chainInfoAddress: settings.chainInfoPrecompile,
  };
}

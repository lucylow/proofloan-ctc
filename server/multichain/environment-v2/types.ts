import type {
  AttestcoinEnvironmentId,
  SourceChainId,
} from "@shared/multichain";

export type OfficialEnvironmentId = AttestcoinEnvironmentId;

export type OfficialDocumentationSource =
  "attestcoin-protocol-chains-environments";

export type OfficialChainRecord = {
  id: SourceChainId;
  displayName: string;
  shortName: string;
  kind: "evm";
  chainId: number;
  chainKey: number;
  genesisBlock: number;
  support: "official";
  environment: OfficialEnvironmentId;
  attestcoinEnabled: true;
  rpcUrl: string;
  documentationStatus: "official";
  sourceDocumentation: OfficialDocumentationSource;
};

export type OfficialEnvironmentRecord = {
  id: OfficialEnvironmentId;
  displayName: string;
  networkKind: "testnet" | "mainnet";
  creditcoinRpcUrl: string;
  ascDashboardUrl: string;
  proofBuilderUrl: string;
  decoderContract: string;
  chainInfoPrecompile: string;
  blockProverPrecompile: string;
  sdkPackage: "@gluwa/usc-sdk";
  chains: readonly OfficialChainRecord[];
};

export type EnvironmentSelectionReason =
  | "default"
  | "explicit"
  | "env"
  | "query"
  | "wallet"
  | "unsupported";

export type EnvironmentResolution = {
  environment: OfficialEnvironmentId;
  reason: EnvironmentSelectionReason;
  warnings: string[];
};

export type OfficialChainResolution = {
  environment: OfficialEnvironmentId;
  chainId: string;
  warnings: string[];
};

export type PublicOfficialChainManifest = {
  id: SourceChainId;
  displayName: string;
  chainId: number;
  chainKey: number;
  genesisBlock: number;
  rpcConfigured: boolean;
  attestcoinEnabled: true;
};

export type PublicOfficialEnvironmentManifest = {
  id: OfficialEnvironmentId;
  displayName: string;
  networkKind: "testnet" | "mainnet";
  ascDashboardUrl: string;
  proofBuilderUrl: string;
  decoderContract: string;
  chainInfoPrecompile: string;
  blockProverPrecompile: string;
  sdkPackage: "@gluwa/usc-sdk";
  chains: PublicOfficialChainManifest[];
};

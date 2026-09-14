import { z } from "zod";
import { BLOCK_PROVER_PRECOMPILE, CHAININFO_PRECOMPILE } from "./multichain";

export const ATTESTOR_NETWORKS = ["cc3-mainnet", "cc3-testnet"] as const;
export type AttestorNetwork = (typeof ATTESTOR_NETWORKS)[number];

export const attestorNetworkSchema = z.enum(ATTESTOR_NETWORKS);

export const ATTESTOR_ELECTION_MODES = ["AuthorizedOnly", "OpenToAny", "DeniedToAll"] as const;
export type AttestorElectionMode = (typeof ATTESTOR_ELECTION_MODES)[number];

export const ATTESTOR_SDK_PACKAGE = "@gluwa/usc-sdk" as const;

export type PerChainAttestorSetting = {
  environment: AttestorNetwork;
  displayName: string;
  releaseImage: string;
  sourceChain: "ethereum-mainnet";
  chainKey: number;
  sourceChainId: number;
  genesisBlock: number;
  cc3RpcUrl: string;
  polkadotJsUrl: string;
  proofBuilderUrl: string;
  dashboardUrl: string;
  blockProverPrecompile: string;
  chainInfoPrecompile: string;
  decoderContract: string;
  sdkPackage: typeof ATTESTOR_SDK_PACKAGE;
  websocketRequired: true;
  p2pPort: number;
  metricsPort: number;
  defaultAttestationStartHeight: "genesis";
  minFreeBalanceCtc: string;
  recommendedFreeBalanceCtc: string;
  minBondRequirementCtc: string;
  electionMode: AttestorElectionMode;
  publicCc3RpcAllowed: boolean;
  ownCc3RpcRecommended: boolean;
  externalEthRpcRequired: boolean;
  productionBootNodesRequired: boolean;
  notes: string[];
};

export type OperatorConfig = {
  name: string;
  chainKey: number;
  secret: string;
  publicAddress?: string;
  apiPort: number;
  p2pPort: number;
  noMdns: boolean;
  bootNodes: string[];
  ethUrl: string;
  cc3Url: string;
  logsPath?: string;
};

export type SettingsValidationIssue = {
  code: string;
  severity: "error" | "warning" | "info";
  field?: string;
  message: string;
};

export type SettingsValidationResult = {
  valid: boolean;
  issues: SettingsValidationIssue[];
  fingerprint: string;
};

export type PublicAttestorManifest = {
  environment: AttestorNetwork;
  displayName: string;
  releaseImage: string;
  chainKey: number;
  sourceChain: "ethereum-mainnet";
  sourceChainId: number;
  genesisBlock: number;
  cc3RpcUrl: string;
  polkadotJsUrl: string;
  proofBuilderUrl: string;
  dashboardUrl: string;
  decoderContract: string;
  blockProverPrecompile: string;
  chainInfoPrecompile: string;
  sdkPackage: typeof ATTESTOR_SDK_PACKAGE;
  electionMode: AttestorElectionMode;
  p2pPort: number;
  metricsPort: number;
  minFreeBalanceCtc: string;
  recommendedFreeBalanceCtc: string;
  minBondRequirementCtc: string;
  productionBootNodesRequired: boolean;
};

/**
 * Authoritative Attestor operator settings for Ethereum Mainnet on CC3.
 * Boot-node multiaddrs and private operator authorization data are intentionally
 * omitted: those remain external protocol/network inputs.
 */
export const OFFICIAL_ATTESTOR_SETTINGS: Record<AttestorNetwork, PerChainAttestorSetting> = {
  "cc3-mainnet": {
    environment: "cc3-mainnet",
    displayName: "CC3 Mainnet / Ethereum Mainnet",
    releaseImage: "gluwa/creditcoin3:3.128.0-mainnet",
    sourceChain: "ethereum-mainnet",
    chainKey: 1,
    sourceChainId: 1,
    genesisBlock: 0,
    cc3RpcUrl: "wss://rpc.cc3-mainnet.creditcoin.network",
    polkadotJsUrl: "https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Fmainnet3.creditcoin.network#/explorer",
    proofBuilderUrl: "https://proofbuilder.cc3-mainnet-usc.creditcoin.network/",
    dashboardUrl: "https://dashboard.cc3-mainnet-usc.creditcoin.network/",
    blockProverPrecompile: BLOCK_PROVER_PRECOMPILE,
    chainInfoPrecompile: CHAININFO_PRECOMPILE,
    decoderContract: "0x9D094C9f22B10FCf842c2fC6A0981630A4F94B5C",
    sdkPackage: ATTESTOR_SDK_PACKAGE,
    websocketRequired: true,
    p2pPort: 9000,
    metricsPort: 9100,
    defaultAttestationStartHeight: "genesis",
    minFreeBalanceCtc: "1",
    recommendedFreeBalanceCtc: "10",
    minBondRequirementCtc: "0",
    electionMode: "AuthorizedOnly",
    publicCc3RpcAllowed: true,
    ownCc3RpcRecommended: true,
    externalEthRpcRequired: true,
    productionBootNodesRequired: true,
    notes: [
      "Use an operator-approved boot node for P2P discovery.",
      "The Attestor and Stash accounts must be different.",
      "Production authorization is an on-chain prerequisite in AuthorizedOnly mode.",
    ],
  },
  "cc3-testnet": {
    environment: "cc3-testnet",
    displayName: "CC3 Testnet / Ethereum Mainnet",
    releaseImage: "gluwa/creditcoin3:3.128.0-testnet",
    sourceChain: "ethereum-mainnet",
    chainKey: 3,
    sourceChainId: 1,
    genesisBlock: 0,
    cc3RpcUrl: "wss://rpc.cc3-testnet.creditcoin.network",
    polkadotJsUrl: "https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Frpc.cc3-testnet.creditcoin.network#/explorer",
    proofBuilderUrl: "https://proof-gen-api.cc3-testnet.creditcoin.network/",
    dashboardUrl: "https://dashboard.cc3-testnet.creditcoin.network/",
    blockProverPrecompile: BLOCK_PROVER_PRECOMPILE,
    chainInfoPrecompile: CHAININFO_PRECOMPILE,
    decoderContract: "0x731c345d79Fb8BbDC541f9DF3b6317585F849F9f",
    sdkPackage: ATTESTOR_SDK_PACKAGE,
    websocketRequired: true,
    p2pPort: 9000,
    metricsPort: 9100,
    defaultAttestationStartHeight: "genesis",
    minFreeBalanceCtc: "1",
    recommendedFreeBalanceCtc: "10",
    minBondRequirementCtc: "100",
    electionMode: "AuthorizedOnly",
    publicCc3RpcAllowed: true,
    ownCc3RpcRecommended: true,
    externalEthRpcRequired: true,
    productionBootNodesRequired: true,
    notes: [
      "Testnet Ethereum source chain uses chain key 3.",
      "The published testnet bond requirement is 100 CTC.",
      "Use the current operator boot node supplied by the Creditcoin team.",
    ],
  },
};

export function isAttestorNetwork(value: string): value is AttestorNetwork {
  return (ATTESTOR_NETWORKS as readonly string[]).includes(value);
}

export function getAttestorSettings(network: AttestorNetwork): PerChainAttestorSetting {
  return OFFICIAL_ATTESTOR_SETTINGS[network];
}

export function allAttestorSettings(): PerChainAttestorSetting[] {
  return ATTESTOR_NETWORKS.map(network => OFFICIAL_ATTESTOR_SETTINGS[network]);
}

export function findByChainKey(network: AttestorNetwork, chainKey: number): PerChainAttestorSetting | undefined {
  const item = getAttestorSettings(network);
  return item.chainKey === chainKey ? item : undefined;
}

export function ctcAmountToAtomic(ctc: string): string {
  const trimmed = typeof ctc === "string" ? ctc.trim() : "";
  if (!/^[0-9]+$/.test(trimmed)) {
    throw new Error("CTC amount must be a non-negative integer.");
  }
  return (BigInt(trimmed) * 10n ** 18n).toString();
}

export function publicAttestorManifest(network: AttestorNetwork): PublicAttestorManifest {
  const item = getAttestorSettings(network);
  return {
    environment: item.environment,
    displayName: item.displayName,
    releaseImage: item.releaseImage,
    chainKey: item.chainKey,
    sourceChain: item.sourceChain,
    sourceChainId: item.sourceChainId,
    genesisBlock: item.genesisBlock,
    cc3RpcUrl: item.cc3RpcUrl,
    polkadotJsUrl: item.polkadotJsUrl,
    proofBuilderUrl: item.proofBuilderUrl,
    dashboardUrl: item.dashboardUrl,
    decoderContract: item.decoderContract,
    blockProverPrecompile: item.blockProverPrecompile,
    chainInfoPrecompile: item.chainInfoPrecompile,
    sdkPackage: item.sdkPackage,
    electionMode: item.electionMode,
    p2pPort: item.p2pPort,
    metricsPort: item.metricsPort,
    minFreeBalanceCtc: item.minFreeBalanceCtc,
    recommendedFreeBalanceCtc: item.recommendedFreeBalanceCtc,
    minBondRequirementCtc: item.minBondRequirementCtc,
    productionBootNodesRequired: item.productionBootNodesRequired,
  };
}

export const operatorConfigSchema = z.object({
  name: z.string().trim().min(1).max(128),
  chainKey: z.number().int().nonnegative(),
  secret: z.string().min(12).max(512),
  publicAddress: z.string().optional(),
  apiPort: z.number().int().min(1).max(65535),
  p2pPort: z.number().int().min(1).max(65535),
  noMdns: z.boolean(),
  bootNodes: z.array(z.string().trim().min(1).max(512)).max(32),
  ethUrl: z.string().url(),
  cc3Url: z.string().url(),
  logsPath: z.string().optional(),
});

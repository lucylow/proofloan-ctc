import {
  BLOCK_PROVER_PRECOMPILE,
  CHAININFO_PRECOMPILE,
  isAttestcoinSourceChainName,
  isSourceChainId,
  sourceChainIdFromName,
  type SourceChainId,
} from "@shared/multichain";
import { AttestcoinError } from "../../attestcoin/errors";
import type {
  OfficialChainRecord,
  OfficialEnvironmentId,
  OfficialEnvironmentRecord,
} from "./types";

const common = {
  chainInfoPrecompile: CHAININFO_PRECOMPILE,
  blockProverPrecompile: BLOCK_PROVER_PRECOMPILE,
  sdkPackage: "@gluwa/usc-sdk" as const,
};

/**
 * Exact documented Attestcoin Protocol chainKeys. Unsupported app chains such
 * as Polygon Amoy are intentionally absent so callers cannot invent mappings.
 */
export const DOCUMENTED_OFFICIAL_CHAINKEYS = {
  "cc3-testnet": {
    "ethereum-sepolia": 1,
    "ethereum-mainnet": 3,
  },
  "cc3-mainnet": {
    "ethereum-mainnet": 1,
  },
} as const;

export const DOCUMENTED_DECODER_CONTRACTS = {
  "cc3-testnet": "0x731c345d79Fb8BbDC541f9DF3b6317585F849F9f",
  "cc3-mainnet": "0x9D094C9f22B10FCf842c2fC6A0981630A4F94B5C",
} as const;

export const DOCUMENTED_PROOF_BUILDERS = {
  "cc3-testnet": "https://proof-gen-api.cc3-testnet.creditcoin.network/",
  "cc3-mainnet": "https://proofbuilder.cc3-mainnet-usc.creditcoin.network/",
} as const;

export const DOCUMENTED_ASC_DASHBOARDS = {
  "cc3-testnet": "https://dashboard.cc3-testnet.creditcoin.network/",
  "cc3-mainnet": "https://dashboard.cc3-mainnet-usc.creditcoin.network/",
} as const;

const ethereumSepolia: OfficialChainRecord = {
  id: "ethereum-sepolia",
  displayName: "Ethereum Sepolia",
  shortName: "Sepolia",
  kind: "evm",
  chainId: 11155111,
  chainKey: DOCUMENTED_OFFICIAL_CHAINKEYS["cc3-testnet"]["ethereum-sepolia"],
  genesisBlock: 0,
  support: "official",
  environment: "cc3-testnet",
  attestcoinEnabled: true,
  rpcUrl: "https://ethereum-sepolia-rpc.publicnode.com",
  documentationStatus: "official",
  sourceDocumentation: "attestcoin-protocol-chains-environments",
};

const ethereumMainnetTestnet: OfficialChainRecord = {
  id: "ethereum-mainnet",
  displayName: "Ethereum Mainnet",
  shortName: "Ethereum",
  kind: "evm",
  chainId: 1,
  chainKey: DOCUMENTED_OFFICIAL_CHAINKEYS["cc3-testnet"]["ethereum-mainnet"],
  genesisBlock: 0,
  support: "official",
  environment: "cc3-testnet",
  attestcoinEnabled: true,
  rpcUrl: "https://ethereum-rpc.publicnode.com",
  documentationStatus: "official",
  sourceDocumentation: "attestcoin-protocol-chains-environments",
};

const ethereumMainnetMainnet: OfficialChainRecord = {
  ...ethereumMainnetTestnet,
  environment: "cc3-mainnet",
  chainKey: DOCUMENTED_OFFICIAL_CHAINKEYS["cc3-mainnet"]["ethereum-mainnet"],
};

export const OFFICIAL_ATTESTCOIN_ENVIRONMENTS: Readonly<
  Record<OfficialEnvironmentId, OfficialEnvironmentRecord>
> = {
  "cc3-testnet": {
    id: "cc3-testnet",
    displayName: "CC3 Testnet",
    networkKind: "testnet",
    creditcoinRpcUrl: "https://rpc.cc3-testnet.creditcoin.network",
    ascDashboardUrl: DOCUMENTED_ASC_DASHBOARDS["cc3-testnet"],
    proofBuilderUrl: DOCUMENTED_PROOF_BUILDERS["cc3-testnet"],
    decoderContract: DOCUMENTED_DECODER_CONTRACTS["cc3-testnet"],
    ...common,
    chains: [ethereumSepolia, ethereumMainnetTestnet],
  },
  "cc3-mainnet": {
    id: "cc3-mainnet",
    displayName: "CC3 Mainnet",
    networkKind: "mainnet",
    creditcoinRpcUrl: "https://rpc.cc3-mainnet.creditcoin.network",
    ascDashboardUrl: DOCUMENTED_ASC_DASHBOARDS["cc3-mainnet"],
    proofBuilderUrl: DOCUMENTED_PROOF_BUILDERS["cc3-mainnet"],
    decoderContract: DOCUMENTED_DECODER_CONTRACTS["cc3-mainnet"],
    ...common,
    chains: [ethereumMainnetMainnet],
  },
};

export function listOfficialEnvironmentIds(): OfficialEnvironmentId[] {
  return Object.keys(OFFICIAL_ATTESTCOIN_ENVIRONMENTS) as OfficialEnvironmentId[];
}

export function isOfficialEnvironment(
  value: string,
): value is OfficialEnvironmentId {
  return Object.prototype.hasOwnProperty.call(
    OFFICIAL_ATTESTCOIN_ENVIRONMENTS,
    value,
  );
}

export function getOfficialEnvironment(value: string): OfficialEnvironmentRecord {
  if (!isOfficialEnvironment(value)) {
    throw new AttestcoinError(
      "VALIDATION",
      `Unsupported official Attestcoin environment: ${value}`,
    );
  }
  return OFFICIAL_ATTESTCOIN_ENVIRONMENTS[value];
}

export function officialChains(environment: string): readonly OfficialChainRecord[] {
  return getOfficialEnvironment(environment).chains;
}

function normalizeChainQuery(value: string): string {
  return value.trim().toLowerCase();
}

export function findOfficialChain(
  environment: string,
  chainId: string,
): OfficialChainRecord | undefined {
  if (!isOfficialEnvironment(environment)) return undefined;
  const query = normalizeChainQuery(chainId);
  const aliased = resolveOfficialChainAlias(query, chainId);
  return officialChains(environment).find(chain => {
    return (
      chain.id === aliased ||
      chain.id === query ||
      String(chain.chainId) === query ||
      chain.displayName.toLowerCase() === query ||
      chain.shortName.toLowerCase() === query
    );
  });
}

export function documentedChainKey(
  environment: string,
  chainId: string,
): number | undefined {
  return findOfficialChain(environment, chainId)?.chainKey;
}

export function isOfficiallyEnabledChain(
  environment: string,
  chainId: string,
): boolean {
  return findOfficialChain(environment, chainId) !== undefined;
}

function resolveOfficialChainAlias(
  query: string,
  original: string,
): SourceChainId | string {
  if (isSourceChainId(query)) return query;
  const trimmed = original.trim();
  if (isAttestcoinSourceChainName(trimmed)) return sourceChainIdFromName(trimmed);

  const aliases: Record<string, SourceChainId> = {
    sepolia: "ethereum-sepolia",
    "eth-sepolia": "ethereum-sepolia",
    "ethereum sepolia": "ethereum-sepolia",
    "11155111": "ethereum-sepolia",
    ethereum: "ethereum-mainnet",
    eth: "ethereum-mainnet",
    "ethereum mainnet": "ethereum-mainnet",
    "1": "ethereum-mainnet",
  };
  return aliases[query] ?? query;
}

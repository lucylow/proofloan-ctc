/**
 * Data-driven Attestcoin Protocol / Creditcoin environment registry.
 *
 * Official chainkeys and endpoints are taken from
 * https://docs.attestcoin.org/attestcoin-protocol/attestcoin-protocol-chains-environments
 *
 * CC3 Testnet: Ethereum Sepolia chainkey 1, Ethereum Mainnet chainkey 3.
 * CC3 Mainnet: Ethereum Mainnet chainkey 1.
 * Polygon Amoy is retained as experimental because it is present in the
 * ProofLoan prototype but is not listed as an official Attestcoin-enabled chain.
 *
 * The documentation-backed environment-v2 layer in
 * `server/multichain/environment-v2` is the authoritative official mapping
 * and must stay aligned with this operational registry.
 */

export const ATTESTCOIN_ENVIRONMENT_IDS = ["cc3-testnet", "cc3-mainnet"] as const;
export type AttestcoinEnvironmentId = (typeof ATTESTCOIN_ENVIRONMENT_IDS)[number];

export const SOURCE_CHAIN_IDS = [
  "ethereum-sepolia",
  "ethereum-mainnet",
  "polygon-amoy",
] as const;
export type SourceChainId = (typeof SOURCE_CHAIN_IDS)[number];

export const ATTESTCOIN_SOURCE_CHAIN_NAMES = [
  "Ethereum Sepolia",
  "Ethereum Mainnet",
  "Polygon Amoy",
] as const;
export type AttestcoinSourceChainName = (typeof ATTESTCOIN_SOURCE_CHAIN_NAMES)[number];

export const SOURCE_CHAIN_SUPPORT = ["official", "experimental"] as const;
export type SourceChainSupport = (typeof SOURCE_CHAIN_SUPPORT)[number];

export const DEFAULT_ATTESTCOIN_ENVIRONMENT: AttestcoinEnvironmentId = "cc3-testnet";

export const CREDITCOIN_CHAIN_IDS = {
  "cc3-testnet": 102031,
  "cc3-mainnet": 102030,
} as const;

export const CREDITCOIN_EVM_VERSION = "shanghai" as const;
export type CreditcoinEvmVersion = typeof CREDITCOIN_EVM_VERSION;

export const CHAININFO_PRECOMPILE = "0x0000000000000000000000000000000000000fd3";
export const BLOCK_PROVER_PRECOMPILE = "0x0000000000000000000000000000000000000FD2";

export const POLYGON_AMOY_LIVE_PROOF_REJECTION =
  "Polygon Amoy is experimental in ProofLoan and is not listed as an official Attestcoin-enabled chain. Current Attestcoin documentation lists Ethereum Sepolia (chainkey 1) and Ethereum Mainnet (chainkey 3) on CC3 Testnet, and Ethereum Mainnet (chainkey 1) on CC3 Mainnet. A live Polygon Amoy proof is rejected because no official chainkey exists. Preview mode remains available.";

export type CreditcoinEnvironmentRecord = {
  id: AttestcoinEnvironmentId;
  label: string;
  networkKind: "testnet" | "mainnet";
  evmChainId: number;
  nativeSymbol: string;
  rpcUrls: readonly string[];
  wsRpcUrls: readonly string[];
  explorerUrl: string;
  proofBuilderUrl: string;
  dashboardUrl: string;
  decoderContract: string;
  chainInfoPrecompile: string;
  blockProverPrecompile: string;
  sdkPackage: string;
  evmVersion: CreditcoinEvmVersion;
};

export type OfficialSourceBinding = {
  chainKey: number;
  genesisBlock: number;
  liveProof: true;
};

export type SourceChainCatalogRecord = {
  id: SourceChainId;
  name: AttestcoinSourceChainName;
  evmChainId: number;
  nativeSymbol: string;
  rpcUrls: readonly string[];
  explorerTxBaseUrl: string;
  support: SourceChainSupport;
  previewEnabled: boolean;
  liveProofDefault: boolean;
  /**
   * ProofLoan operational confirmation depth for source-chain observation.
   * Ethereum uses 32 to match USC prover operational guidance; this is not a
   * published Attestcoin chainkey.
   */
  confirmationDepth: number;
  staleAfterBlocks: number;
  preview: {
    txPrefix: string;
    sourceBlock: number;
    verificationBlock: number;
  };
};

export type MultichainRegistry = {
  environments: Record<AttestcoinEnvironmentId, CreditcoinEnvironmentRecord>;
  sourceChains: Record<SourceChainId, SourceChainCatalogRecord>;
  officialBindings: Record<
    AttestcoinEnvironmentId,
    Partial<Record<SourceChainId, OfficialSourceBinding>>
  >;
};

export const MULTICHAIN_REGISTRY: MultichainRegistry = {
  environments: {
    "cc3-testnet": {
      id: "cc3-testnet",
      label: "CC3 Testnet",
      networkKind: "testnet",
      evmChainId: CREDITCOIN_CHAIN_IDS["cc3-testnet"],
      nativeSymbol: "tCTC",
      rpcUrls: ["https://rpc.cc3-testnet.creditcoin.network"],
      wsRpcUrls: ["wss://rpc.cc3-testnet.creditcoin.network"],
      explorerUrl: "https://creditcoin-testnet.blockscout.com/",
      proofBuilderUrl: "https://proof-gen-api.cc3-testnet.creditcoin.network",
      dashboardUrl: "https://dashboard.cc3-testnet.creditcoin.network/",
      decoderContract: "0x731c345d79Fb8BbDC541f9DF3b6317585F849F9f",
      chainInfoPrecompile: CHAININFO_PRECOMPILE,
      blockProverPrecompile: BLOCK_PROVER_PRECOMPILE,
      sdkPackage: "@gluwa/usc-sdk",
      evmVersion: CREDITCOIN_EVM_VERSION,
    },
    "cc3-mainnet": {
      id: "cc3-mainnet",
      label: "CC3 Mainnet",
      networkKind: "mainnet",
      evmChainId: CREDITCOIN_CHAIN_IDS["cc3-mainnet"],
      nativeSymbol: "CTC",
      rpcUrls: [
        "https://rpc.cc3-mainnet.creditcoin.network",
        "https://mainnet3.creditcoin.network",
      ],
      wsRpcUrls: [
        "wss://rpc.cc3-mainnet.creditcoin.network",
        "wss://mainnet3.creditcoin.network",
      ],
      explorerUrl: "https://creditcoin.blockscout.com/",
      proofBuilderUrl: "https://proofbuilder.cc3-mainnet-usc.creditcoin.network",
      dashboardUrl: "https://dashboard.cc3-mainnet-usc.creditcoin.network/",
      decoderContract: "0x9D094C9f22B10FCf842c2fC6A0981630A4F94B5C",
      chainInfoPrecompile: CHAININFO_PRECOMPILE,
      blockProverPrecompile: BLOCK_PROVER_PRECOMPILE,
      sdkPackage: "@gluwa/usc-sdk",
      evmVersion: CREDITCOIN_EVM_VERSION,
    },
  },
  sourceChains: {
    "ethereum-sepolia": {
      id: "ethereum-sepolia",
      name: "Ethereum Sepolia",
      evmChainId: 11155111,
      nativeSymbol: "ETH",
      rpcUrls: [
        "https://ethereum-sepolia-rpc.publicnode.com",
        "https://1rpc.io/sepolia",
      ],
      explorerTxBaseUrl: "https://sepolia.etherscan.io/tx/",
      support: "official",
      previewEnabled: true,
      liveProofDefault: true,
      confirmationDepth: 32,
      staleAfterBlocks: 200_000,
      preview: {
        txPrefix: "0x7a",
        sourceBlock: 6_421_883,
        verificationBlock: 7_000_000,
      },
    },
    "ethereum-mainnet": {
      id: "ethereum-mainnet",
      name: "Ethereum Mainnet",
      evmChainId: 1,
      nativeSymbol: "ETH",
      rpcUrls: [
        "https://ethereum-rpc.publicnode.com",
        "https://cloudflare-eth.com",
      ],
      explorerTxBaseUrl: "https://etherscan.io/tx/",
      support: "official",
      previewEnabled: true,
      liveProofDefault: true,
      confirmationDepth: 32,
      staleAfterBlocks: 200_000,
      preview: {
        txPrefix: "0x1a",
        sourceBlock: 18_420_112,
        verificationBlock: 19_000_000,
      },
    },
    "polygon-amoy": {
      id: "polygon-amoy",
      name: "Polygon Amoy",
      evmChainId: 80002,
      nativeSymbol: "MATIC",
      rpcUrls: [
        "https://polygon-amoy-bor-rpc.publicnode.com",
        "https://rpc-amoy.polygon.technology",
      ],
      explorerTxBaseUrl: "https://amoy.polygonscan.com/tx/",
      support: "experimental",
      previewEnabled: true,
      liveProofDefault: false,
      confirmationDepth: 64,
      staleAfterBlocks: 400_000,
      preview: {
        txPrefix: "0x9b",
        sourceBlock: 12_804_112,
        verificationBlock: 13_000_000,
      },
    },
  },
  officialBindings: {
    "cc3-testnet": {
      "ethereum-sepolia": { chainKey: 1, genesisBlock: 0, liveProof: true },
      "ethereum-mainnet": { chainKey: 3, genesisBlock: 0, liveProof: true },
    },
    "cc3-mainnet": {
      "ethereum-mainnet": { chainKey: 1, genesisBlock: 0, liveProof: true },
    },
  },
};

const NAME_TO_ID: Record<AttestcoinSourceChainName, SourceChainId> = {
  "Ethereum Sepolia": "ethereum-sepolia",
  "Ethereum Mainnet": "ethereum-mainnet",
  "Polygon Amoy": "polygon-amoy",
};

export function isAttestcoinEnvironmentId(
  value: string,
): value is AttestcoinEnvironmentId {
  return (ATTESTCOIN_ENVIRONMENT_IDS as readonly string[]).includes(value);
}

export function isSourceChainId(value: string): value is SourceChainId {
  return (SOURCE_CHAIN_IDS as readonly string[]).includes(value);
}

export function isAttestcoinSourceChainName(
  value: string,
): value is AttestcoinSourceChainName {
  return (ATTESTCOIN_SOURCE_CHAIN_NAMES as readonly string[]).includes(value);
}

export function sourceChainIdFromName(
  name: AttestcoinSourceChainName,
): SourceChainId {
  return NAME_TO_ID[name];
}

export function sourceChainNameFromId(id: SourceChainId): AttestcoinSourceChainName {
  return MULTICHAIN_REGISTRY.sourceChains[id].name;
}

export function getSourceChainRecord(
  chain: AttestcoinSourceChainName | SourceChainId,
): SourceChainCatalogRecord {
  const id = isSourceChainId(chain) ? chain : sourceChainIdFromName(chain);
  return MULTICHAIN_REGISTRY.sourceChains[id];
}

export function getEnvironmentRecord(
  environment: AttestcoinEnvironmentId,
): CreditcoinEnvironmentRecord {
  return MULTICHAIN_REGISTRY.environments[environment];
}

export function getOfficialBinding(
  environment: AttestcoinEnvironmentId,
  chain: AttestcoinSourceChainName | SourceChainId,
): OfficialSourceBinding | undefined {
  const id = isSourceChainId(chain) ? chain : sourceChainIdFromName(chain);
  return MULTICHAIN_REGISTRY.officialBindings[environment][id];
}

export function listOfficialSourceChains(
  environment: AttestcoinEnvironmentId,
): SourceChainCatalogRecord[] {
  const bindings = MULTICHAIN_REGISTRY.officialBindings[environment];
  return SOURCE_CHAIN_IDS
    .filter(id => bindings[id] !== undefined)
    .map(id => MULTICHAIN_REGISTRY.sourceChains[id]);
}

export function listPreviewSourceChains(): SourceChainCatalogRecord[] {
  return SOURCE_CHAIN_IDS
    .map(id => MULTICHAIN_REGISTRY.sourceChains[id])
    .filter(chain => chain.previewEnabled);
}

export function hasOfficialChainKey(
  environment: AttestcoinEnvironmentId,
  chain: AttestcoinSourceChainName | SourceChainId,
): boolean {
  return getOfficialBinding(environment, chain) !== undefined;
}

export function getExplorerTxUrl(
  chain: AttestcoinSourceChainName | SourceChainId,
  txHash: string,
): string {
  return `${getSourceChainRecord(chain).explorerTxBaseUrl}${txHash}`;
}

export function rpcUrlConflictsWithEnvironment(
  url: string,
  environment: AttestcoinEnvironmentId,
): string | undefined {
  let host: string;
  try {
    host = new URL(url).hostname.toLowerCase();
  } catch {
    return `Invalid Creditcoin RPC URL for ${environment}: ${url}`;
  }
  const mentionsTestnet = host.includes("testnet") || host.includes("cc3-test");
  const mentionsMainnet =
    (host.includes("mainnet") || /^mainnet\d+\./.test(host)) && !mentionsTestnet;
  if (environment === "cc3-mainnet" && mentionsTestnet) {
    return `RPC ${url} points at Creditcoin testnet but the selected environment is cc3-mainnet.`;
  }
  if (environment === "cc3-testnet" && mentionsMainnet) {
    return `RPC ${url} points at Creditcoin mainnet but the selected environment is cc3-testnet.`;
  }
  return undefined;
}

export function experimentalLiveProofMessage(
  chain: AttestcoinSourceChainName | SourceChainId,
): string {
  const record = getSourceChainRecord(chain);
  if (record.id === "polygon-amoy") return POLYGON_AMOY_LIVE_PROOF_REJECTION;
  return `${record.name} is not listed with an official Attestcoin chainkey in the active Creditcoin environment. Live proofs are rejected. Preview mode remains available.`;
}

export type ChainCapability = {
  environment: AttestcoinEnvironmentId;
  chainId: SourceChainId;
  name: AttestcoinSourceChainName;
  support: SourceChainSupport;
  preview: boolean;
  liveProof: boolean;
  chainKey: number | null;
  genesisBlock: number | null;
  confirmationDepth: number;
  staleAfterBlocks: number;
  freeCrossChainReads: true;
  atcPaidActions: boolean;
  reason?: string;
};

export function chainCapability(
  environment: AttestcoinEnvironmentId,
  chain: AttestcoinSourceChainName | SourceChainId,
): ChainCapability {
  const record = getSourceChainRecord(chain);
  const binding = getOfficialBinding(environment, record.id);
  const liveProof = Boolean(binding?.liveProof) && record.liveProofDefault;
  return {
    environment,
    chainId: record.id,
    name: record.name,
    support: record.support,
    preview: record.previewEnabled,
    liveProof,
    chainKey: binding?.chainKey ?? null,
    genesisBlock: binding?.genesisBlock ?? null,
    confirmationDepth: record.confirmationDepth,
    staleAfterBlocks: record.staleAfterBlocks,
    freeCrossChainReads: true,
    atcPaidActions: true,
    reason: liveProof ? undefined : experimentalLiveProofMessage(record.id),
  };
}

export function listChainCapabilities(
  environment: AttestcoinEnvironmentId,
): ChainCapability[] {
  return SOURCE_CHAIN_IDS.map(id => chainCapability(environment, id));
}

export function registryIntegrityIssues(
  registry: MultichainRegistry = MULTICHAIN_REGISTRY,
): string[] {
  const issues: string[] = [];

  for (const environmentId of ATTESTCOIN_ENVIRONMENT_IDS) {
    const environment = registry.environments[environmentId];
    if (!environment) {
      issues.push(`Missing environment record: ${environmentId}`);
      continue;
    }
    if (environment.rpcUrls.length === 0) {
      issues.push(`${environmentId} has no Creditcoin RPC URLs.`);
    }
    if (environment.evmChainId !== CREDITCOIN_CHAIN_IDS[environmentId]) {
      issues.push(
        `${environmentId} evmChainId ${environment.evmChainId} does not match documented ${CREDITCOIN_CHAIN_IDS[environmentId]}.`,
      );
    }
    if (environment.evmVersion !== CREDITCOIN_EVM_VERSION) {
      issues.push(`${environmentId} must compile for Creditcoin Frontier evmVersion shanghai.`);
    }
    if (!environment.explorerUrl.startsWith("https://")) {
      issues.push(`${environmentId} explorer URL must be https.`);
    }
    if (environment.nativeSymbol.trim() === "") {
      issues.push(`${environmentId} is missing a native symbol.`);
    }
    if (!environment.proofBuilderUrl.startsWith("https://")) {
      issues.push(`${environmentId} proof builder URL must be https.`);
    }
    for (const url of environment.rpcUrls) {
      const conflict = rpcUrlConflictsWithEnvironment(url, environmentId);
      if (conflict) issues.push(conflict);
    }

    const keys = new Map<number, SourceChainId>();
    const bindings = registry.officialBindings[environmentId] ?? {};
    for (const [chainId, binding] of Object.entries(bindings) as Array<
      [SourceChainId, OfficialSourceBinding | undefined]
    >) {
      if (!binding) continue;
      if (!isSourceChainId(chainId)) {
        issues.push(`${environmentId} binds unknown chain ${chainId}.`);
        continue;
      }
      if (!Number.isInteger(binding.chainKey) || binding.chainKey <= 0) {
        issues.push(`${environmentId}/${chainId} has an invalid chainkey.`);
      }
      const existing = keys.get(binding.chainKey);
      if (existing) {
        issues.push(
          `${environmentId} reuses chainkey ${binding.chainKey} for ${existing} and ${chainId}.`,
        );
      } else {
        keys.set(binding.chainKey, chainId);
      }
      if (registry.sourceChains[chainId]?.support !== "official") {
        issues.push(
          `${environmentId} binds ${chainId} as official even though the catalog marks it experimental.`,
        );
      }
    }
  }

  for (const chainId of SOURCE_CHAIN_IDS) {
    const chain = registry.sourceChains[chainId];
    if (!chain) {
      issues.push(`Missing source chain record: ${chainId}`);
      continue;
    }
    if (chain.rpcUrls.length === 0) {
      issues.push(`${chainId} has no source RPC URLs.`);
    }
    if (chain.support === "experimental" && chain.liveProofDefault) {
      issues.push(`${chainId} is experimental but defaults to live proof.`);
    }
    const boundSomewhere = ATTESTCOIN_ENVIRONMENT_IDS.some(
      environmentId => registry.officialBindings[environmentId][chainId],
    );
    if (chain.support === "official" && !boundSomewhere) {
      issues.push(`${chainId} is marked official but has no environment binding.`);
    }
    if (chain.support === "experimental" && boundSomewhere) {
      issues.push(`${chainId} is experimental but has an official chainkey binding.`);
    }
    if (!Number.isInteger(chain.confirmationDepth) || chain.confirmationDepth < 1) {
      issues.push(`${chainId} confirmationDepth must be a positive integer.`);
    }
    if (!Number.isInteger(chain.staleAfterBlocks) || chain.staleAfterBlocks <= chain.confirmationDepth) {
      issues.push(`${chainId} staleAfterBlocks must be greater than confirmationDepth.`);
    }
  }

  return issues;
}

import {
  CREDITCOIN_CHAIN_IDS,
  CREDITCOIN_EVM_VERSION,
  MULTICHAIN_REGISTRY,
  getEnvironmentRecord,
  rpcUrlConflictsWithEnvironment,
  type AttestcoinEnvironmentId,
} from "@shared/multichain";
import { resolveCreditcoinRpcUrls } from "../multichain/environment";
import { DeployError } from "./errors";

export type CreditcoinDeployNetworkId = AttestcoinEnvironmentId;

export type CreditcoinDeployNetwork = {
  id: CreditcoinDeployNetworkId;
  label: string;
  networkKind: "testnet" | "mainnet";
  evmChainId: number;
  nativeSymbol: string;
  rpcUrls: readonly string[];
  wsRpcUrls: readonly string[];
  explorerUrl: string;
  decoderContract: string;
  evmVersion: typeof CREDITCOIN_EVM_VERSION;
  minConfirmations: number;
  gasMultiplierBps: number;
  requiresMainnetConfirmation: boolean;
};

export const CREDITCOIN_DEPLOY_NETWORKS: Record<
  CreditcoinDeployNetworkId,
  CreditcoinDeployNetwork
> = {
  "cc3-testnet": {
    id: "cc3-testnet",
    label: "Creditcoin Testnet",
    networkKind: "testnet",
    evmChainId: CREDITCOIN_CHAIN_IDS["cc3-testnet"],
    nativeSymbol: "tCTC",
    rpcUrls: MULTICHAIN_REGISTRY.environments["cc3-testnet"].rpcUrls,
    wsRpcUrls: MULTICHAIN_REGISTRY.environments["cc3-testnet"].wsRpcUrls,
    explorerUrl: MULTICHAIN_REGISTRY.environments["cc3-testnet"].explorerUrl,
    decoderContract: MULTICHAIN_REGISTRY.environments["cc3-testnet"].decoderContract,
    evmVersion: CREDITCOIN_EVM_VERSION,
    minConfirmations: 1,
    gasMultiplierBps: 300,
    requiresMainnetConfirmation: false,
  },
  "cc3-mainnet": {
    id: "cc3-mainnet",
    label: "Creditcoin Mainnet",
    networkKind: "mainnet",
    evmChainId: CREDITCOIN_CHAIN_IDS["cc3-mainnet"],
    nativeSymbol: "CTC",
    rpcUrls: MULTICHAIN_REGISTRY.environments["cc3-mainnet"].rpcUrls,
    wsRpcUrls: MULTICHAIN_REGISTRY.environments["cc3-mainnet"].wsRpcUrls,
    explorerUrl: MULTICHAIN_REGISTRY.environments["cc3-mainnet"].explorerUrl,
    decoderContract: MULTICHAIN_REGISTRY.environments["cc3-mainnet"].decoderContract,
    evmVersion: CREDITCOIN_EVM_VERSION,
    minConfirmations: 2,
    gasMultiplierBps: 300,
    requiresMainnetConfirmation: true,
  },
};

export function isCreditcoinDeployNetworkId(
  value: string,
): value is CreditcoinDeployNetworkId {
  return value === "cc3-testnet" || value === "cc3-mainnet";
}

export function parseDeployNetworkId(
  value: string | undefined,
): CreditcoinDeployNetworkId {
  const normalized = (value ?? "cc3-testnet").trim().toLowerCase();
  if (normalized === "testnet" || normalized === "creditcoin_testnet") {
    return "cc3-testnet";
  }
  if (normalized === "mainnet" || normalized === "creditcoin_mainnet") {
    return "cc3-mainnet";
  }
  if (!isCreditcoinDeployNetworkId(normalized)) {
    throw new DeployError(
      "CONFIG",
      `Unknown deploy network '${value}'. Use cc3-testnet or cc3-mainnet.`,
    );
  }
  return normalized;
}

export function getDeployNetwork(
  network: string | undefined,
): CreditcoinDeployNetwork {
  return CREDITCOIN_DEPLOY_NETWORKS[parseDeployNetworkId(network)];
}

export function explorerAddressUrl(network: CreditcoinDeployNetwork, address: string) {
  const base = network.explorerUrl.endsWith("/")
    ? network.explorerUrl
    : `${network.explorerUrl}/`;
  return `${base}address/${address}`;
}

export function explorerTxUrl(network: CreditcoinDeployNetwork, txHash: string) {
  const base = network.explorerUrl.endsWith("/")
    ? network.explorerUrl
    : `${network.explorerUrl}/`;
  return `${base}tx/${txHash}`;
}

export function resolveDeployRpcUrls(
  network: CreditcoinDeployNetwork,
  env: Record<string, string | undefined> = process.env,
): string[] {
  const resolved = resolveCreditcoinRpcUrls(network.id, env, network.rpcUrls);
  const urls = resolved.urls.filter(
    url => rpcUrlConflictsWithEnvironment(url, network.id) === undefined,
  );
  if (urls.length === 0) {
    throw new DeployError(
      "NETWORK",
      `No compatible ${network.label} RPC URLs. Documented endpoints: ${network.rpcUrls.join(", ")}.`,
    );
  }
  const expectedChainId = getEnvironmentRecord(network.id).evmChainId;
  if (expectedChainId !== network.evmChainId) {
    throw new DeployError(
      "CHAIN_ID",
      `${network.id} deploy chain ID drifted from the operational registry.`,
    );
  }
  return urls;
}

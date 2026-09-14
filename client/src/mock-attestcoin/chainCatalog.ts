import type { MockChain, MockChainId } from "./types";

export const MOCK_CHAINS: MockChain[] = [
  {
    id: "ethereum-sepolia",
    name: "Ethereum Sepolia",
    chainKey: 1,
    chainId: 11155111,
    nativeSymbol: "ETH",
    explorerTx: "https://sepolia.etherscan.io/tx/",
    enabled: true,
  },
  {
    id: "polygon-amoy",
    name: "Polygon Amoy",
    chainKey: null,
    chainId: 80002,
    nativeSymbol: "MATIC",
    explorerTx: "https://amoy.polygonscan.com/tx/",
    enabled: true,
    experimental: true,
  },
  {
    id: "arbitrum-sepolia",
    name: "Arbitrum Sepolia",
    chainKey: null,
    chainId: 421614,
    nativeSymbol: "ETH",
    explorerTx: "https://sepolia.arbiscan.io/tx/",
    enabled: true,
    experimental: true,
  },
  {
    id: "base-sepolia",
    name: "Base Sepolia",
    chainKey: null,
    chainId: 84532,
    nativeSymbol: "ETH",
    explorerTx: "https://sepolia.basescan.org/tx/",
    enabled: true,
    experimental: true,
  },
  {
    id: "optimism-sepolia",
    name: "Optimism Sepolia",
    chainKey: null,
    chainId: 11155420,
    nativeSymbol: "ETH",
    explorerTx: "https://sepolia-optimism.etherscan.io/tx/",
    enabled: true,
    experimental: true,
  },
];

export function getMockChain(id: MockChainId) {
  return MOCK_CHAINS.find(chain => chain.id === id) ?? MOCK_CHAINS[0]!;
}

export function mockChainName(id: MockChainId) {
  return getMockChain(id).name;
}

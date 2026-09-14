import { PRIMARY_WALLET_ID } from "../constants";
import type { MockChainId, MockScenario, MockWallet } from "../types";
import { seededInteger } from "../utils";

const addresses = [
  "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
  "0x91A7F4A9c03f6E41E7e0e14c9A2F6e3F4E53f02A",
  "0x3B4E92D7A10178aE5eD42A83A10aB3c9A7D8E1F2",
  "0x8A4C9D2B1E7F0A3F9A1B7C2D6E4F8A9B0C2D3E4F",
] as const;

const chains: MockChainId[] = [
  "ethereum-sepolia",
  "polygon-amoy",
  "arbitrum-sepolia",
  "base-sepolia",
];

export function createMockWallets(seed: string, scenario: MockScenario): MockWallet[] {
  if (scenario === "empty") return [];

  const young = scenario === "new-wallet";
  const wealthy = scenario === "cross-chain-wealth";

  return addresses.map((address, index) => ({
    id: index === 0 ? PRIMARY_WALLET_ID : `wallet-${index + 1}`,
    label: index === 0 ? "Primary Wallet" : `Wallet ${index + 1}`,
    address,
    ens: index === 0 ? "borrower.demo.eth" : undefined,
    chainId: chains[index] ?? "ethereum-sepolia",
    nativeBalance: young ? 0.08 : wealthy ? 12 + index * 3 : 0.4 + index * 0.9,
    stablecoinBalance: young
      ? 180
      : wealthy
        ? 18_000 + index * 4_200
        : 1_280 + index * 2_100,
    walletAgeDays: young ? 11 + index : seededInteger(`${seed}:age:${index}`, 90, 640),
    verified: scenario !== "new-wallet" || index === 0,
    connected: index === 0,
  }));
}

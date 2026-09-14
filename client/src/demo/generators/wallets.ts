import type { DemoWallet } from "../types";
import { DEMO_ADDRESSES } from "../constants";

export function createDemoWallets(): DemoWallet[] {
  return [
    {
      id: "wallet-primary",
      label: "Primary Wallet",
      address: DEMO_ADDRESSES.primary,
      ens: "borrower.demo.eth",
      chain: "Ethereum Sepolia",
      chainId: 11155111,
      nativeBalance: "1.284 ETH",
      stablecoinBalance: "8,420 USDC",
      walletAgeDays: 412,
      verified: true,
      connected: true,
    },

    {
      id: "wallet-secondary",
      label: "Secondary Wallet",
      address: DEMO_ADDRESSES.secondary,
      chain: "Polygon Amoy",
      chainId: 80002,
      nativeBalance: "12.42 MATIC",
      stablecoinBalance: "4,100 USDC",
      walletAgeDays: 265,
      verified: true,
      connected: false,
    },

    {
      id: "wallet-observer",
      label: "Observer Wallet",
      address: DEMO_ADDRESSES.borrowerTwo,
      chain: "Ethereum Sepolia",
      chainId: 11155111,
      nativeBalance: "0.42 ETH",
      stablecoinBalance: "1,280 USDC",
      walletAgeDays: 89,
      verified: false,
      connected: false,
    },
  ];
}

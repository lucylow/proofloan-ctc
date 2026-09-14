import { createContext, createElement, useContext, type ReactNode } from "react";
import { useHardenedDappWallet } from "./useHardenedDappWallet";

type DappWalletValue = ReturnType<typeof useHardenedDappWallet>;

const DappWalletContext = createContext<DappWalletValue | null>(null);

export function DappWalletProvider({ children }: { children: ReactNode }) {
  const value = useHardenedDappWallet();
  return createElement(DappWalletContext.Provider, { value }, children);
}

export function useDappWallet() {
  const value = useContext(DappWalletContext);
  if (!value) {
    throw new Error("useDappWallet must be used within DappWalletProvider");
  }
  return value;
}

export { useHardenedDappWallet } from "./useHardenedDappWallet";
export type { HardenedWallet } from "./useHardenedDappWallet";

export function shortenAddress(address: string) {
  if (!address) {
    return "";
  }

  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

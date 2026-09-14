import { useCallback, useEffect, useRef, useState } from "react";
import { BrowserProvider } from "ethers";
import { reportClientError } from "@/lib/clientErrorReporter";
import { assertSupportedChain, chainName } from "@/hardening/chainGuard";
import { getExistingAccounts, getInjectedProvider, requestAccounts } from "@/hardening/walletProvider";
import { normalizeAppError } from "@/hardening/appError";
import type { WalletConnectionState } from "@/navigation/types";

export type HardenedWallet = {
  address: string;
  chainId: number;
  chainName: string;
};

function shorten(value: string) {
  return value ? `${value.slice(0, 6)}…${value.slice(-4)}` : "";
}

export function useHardenedDappWallet() {
  const [state, setState] = useState<WalletConnectionState>("disconnected");
  const [wallet, setWallet] = useState<HardenedWallet | null>(null);
  const [error, setError] = useState<string | null>(null);
  const syncing = useRef(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const applyAccounts = useCallback(async (accounts: string[]) => {
    if (!mounted.current) return;
    if (accounts.length === 0) {
      setWallet(null);
      setState("disconnected");
      return;
    }

    const provider = getInjectedProvider();
    if (!provider) {
      setWallet(null);
      setState("error");
      setError("No compatible wallet provider is available.");
      return;
    }

    try {
      const ethersProvider = new BrowserProvider(provider as never);
      const network = await ethersProvider.getNetwork();
      const chainId = Number(network.chainId);
      const chainResult = assertSupportedChain(chainId);

      const nextWallet = {
        address: accounts[0],
        chainId,
        chainName: chainName(chainId),
      };

      setWallet(nextWallet);

      if (!chainResult.ok) {
        setState("wrong-network");
        setError(chainResult.error.userMessage);
        return;
      }

      setState("connected");
      setError(null);
    } catch (cause) {
      const normalized = normalizeAppError(cause, { source: "wallet" });
      setState("error");
      setError(normalized.userMessage);
      reportClientError("runtime", cause);
    }
  }, []);

  const refresh = useCallback(async () => {
    if (syncing.current) return;
    syncing.current = true;

    try {
      const result = await getExistingAccounts();
      if (!result.ok) {
        if (mounted.current) {
          setState("error");
          setError(result.error.userMessage);
        }
        return;
      }
      await applyAccounts(result.value);
    } finally {
      syncing.current = false;
    }
  }, [applyAccounts]);

  const connect = useCallback(async () => {
    if (syncing.current) return;
    setState("connecting");
    setError(null);

    const result = await requestAccounts();
    if (!mounted.current) return;

    if (!result.ok) {
      setState(result.error.code === "WALLET_REJECTED" ? "disconnected" : "error");
      setError(result.error.userMessage);
      return;
    }

    await applyAccounts(result.value);
  }, [applyAccounts]);

  const disconnect = useCallback(() => {
    setWallet(null);
    setState("disconnected");
    setError(null);
  }, []);

  const switchToSepolia = useCallback(async () => {
    const provider = getInjectedProvider();
    if (!provider) {
      setState("error");
      setError("No compatible wallet provider is available.");
      return;
    }

    try {
      await provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0xaa36a7" }],
      });
      await refresh();
    } catch (cause) {
      const normalized = normalizeAppError(cause, { source: "wallet" });
      setError(normalized.userMessage);
      reportClientError("runtime", cause);
    }
  }, [refresh]);

  useEffect(() => {
    void refresh();

    const provider = getInjectedProvider();
    if (!provider?.on || !provider.removeListener) return;

    const accountsChanged = (...args: unknown[]) => {
      const [accounts] = args;
      if (Array.isArray(accounts)) {
        void applyAccounts(accounts.filter((item): item is string => typeof item === "string"));
      } else {
        void refresh();
      }
    };

    const chainChanged = () => void refresh();
    const disconnectEvent = () => disconnect();

    provider.on("accountsChanged", accountsChanged);
    provider.on("chainChanged", chainChanged);
    provider.on("disconnect", disconnectEvent);

    return () => {
      provider.removeListener?.("accountsChanged", accountsChanged);
      provider.removeListener?.("chainChanged", chainChanged);
      provider.removeListener?.("disconnect", disconnectEvent);
    };
  }, [applyAccounts, disconnect, refresh]);

  return {
    state,
    wallet,
    error,
    connect,
    disconnect,
    refresh,
    switchToSepolia,
    isConnected: state === "connected",
    isWrongNetwork: state === "wrong-network",
    shortAddress: wallet ? shorten(wallet.address) : "",
    chainId: wallet?.chainId ?? null,
  };
}

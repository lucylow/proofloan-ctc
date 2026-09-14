import { BrowserProvider, JsonRpcSigner } from "ethers";
import { ProofLoanAppError, normalizeAppError } from "./appError";
import type { Result } from "./types";

export type Eip1193Provider = {
  request(args: { method: string; params?: unknown[] }): Promise<unknown>;
  on?: (event: string, listener: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, listener: (...args: unknown[]) => void) => void;
};

export function getInjectedProvider(): Eip1193Provider | undefined {
  if (typeof window === "undefined") return undefined;
  const provider = (window as Window & { ethereum?: Eip1193Provider }).ethereum;
  return provider;
}

export function hasWalletProvider(): boolean {
  return Boolean(getInjectedProvider());
}

function parseWalletError(error: unknown): ProofLoanAppError {
  const message = error instanceof Error ? error.message : String(error ?? "Unknown wallet error");
  const normalized = message.toLowerCase();

  if (normalized.includes("4001") || normalized.includes("rejected")) {
    return new ProofLoanAppError({
      code: "WALLET_REJECTED",
      message,
      source: "wallet",
      retryable: false,
    });
  }

  if (normalized.includes("4900") || normalized.includes("disconnected")) {
    return new ProofLoanAppError({
      code: "WALLET_DISCONNECTED",
      message,
      source: "wallet",
      retryable: true,
    });
  }

  return new ProofLoanAppError({
    code: "WALLET_FAILED",
    message,
    source: "wallet",
    retryable: true,
  });
}

export async function requestAccounts(): Promise<Result<string[]>> {
  const provider = getInjectedProvider();
  if (!provider) {
    return {
      ok: false,
      error: normalizeAppError(
        new ProofLoanAppError({
          code: "WALLET_MISSING",
          message: "No injected wallet provider",
          source: "wallet",
        }),
      ),
    };
  }

  try {
    const accounts = await provider.request({ method: "eth_requestAccounts" });
    if (!Array.isArray(accounts)) throw new Error("Wallet returned invalid accounts payload");
    return { ok: true, value: accounts.filter((account): account is string => typeof account === "string") };
  } catch (error) {
    return { ok: false, error: normalizeAppError(parseWalletError(error), { source: "wallet" }) };
  }
}

export async function getExistingAccounts(): Promise<Result<string[]>> {
  const provider = getInjectedProvider();
  if (!provider) return { ok: true, value: [] };

  try {
    const accounts = await provider.request({ method: "eth_accounts" });
    if (!Array.isArray(accounts)) throw new Error("Wallet returned invalid accounts payload");
    return { ok: true, value: accounts.filter((account): account is string => typeof account === "string") };
  } catch (error) {
    return { ok: false, error: normalizeAppError(error, { source: "wallet" }) };
  }
}

export async function createSafeSigner(): Promise<Result<JsonRpcSigner>> {
  const provider = getInjectedProvider();
  if (!provider) {
    return {
      ok: false,
      error: normalizeAppError(new ProofLoanAppError({
        code: "WALLET_MISSING",
        message: "No wallet",
        source: "wallet",
      })),
    };
  }

  try {
    const ethersProvider = new BrowserProvider(provider as never);
    const signer = await ethersProvider.getSigner();
    return { ok: true, value: signer };
  } catch (error) {
    return { ok: false, error: normalizeAppError(parseWalletError(error), { source: "wallet" }) };
  }
}

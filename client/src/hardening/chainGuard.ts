import { normalizeAppError, ProofLoanAppError } from "./appError";
import type { Result } from "./types";

export const SUPPORTED_CHAINS = {
  11155111: "Ethereum Sepolia",
  1: "Ethereum Mainnet",
  80002: "Polygon Amoy",
} as const;

export type SupportedChainId = keyof typeof SUPPORTED_CHAINS;

export function isSupportedChainId(value: number): value is SupportedChainId {
  return value in SUPPORTED_CHAINS;
}

export function parseChainId(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isInteger(value) && value > 0) return value;
  if (typeof value === "string") {
    const parsed = value.startsWith("0x") ? Number.parseInt(value, 16) : Number(value);
    if (Number.isInteger(parsed) && parsed > 0) return parsed;
  }
  return undefined;
}

export function assertSupportedChain(value: unknown): Result<SupportedChainId> {
  const chainId = parseChainId(value);
  if (!chainId || !isSupportedChainId(chainId)) {
    return {
      ok: false,
      error: normalizeAppError(new ProofLoanAppError({
        code: "WRONG_NETWORK",
        message: `Unsupported chain: ${String(value)}`,
        source: "wallet",
      })),
    };
  }
  return { ok: true, value: chainId };
}

export function chainName(chainId: number): string {
  return SUPPORTED_CHAINS[chainId as SupportedChainId] ?? `Chain ${chainId}`;
}

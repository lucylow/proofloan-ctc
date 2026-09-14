import { AiError } from "../errors";

export function allowedChain(chainId: string, allowlist: Set<string>) {
  return allowlist.has(chainId);
}

export function requireVerifiedChain(chainId: string, allowlist: Set<string>) {
  if (!allowlist.has(chainId)) {
    throw new AiError("VALIDATION", `Unsupported chain: ${chainId}`);
  }
}

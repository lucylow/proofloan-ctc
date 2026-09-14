import { isLiveTxHash } from "@shared/proofloan";
import {
  experimentalLiveProofMessage,
  type AttestcoinSourceChainName,
} from "@shared/multichain";
import { officialRegistry } from "./environment-v2/registry";
import { resolveSourceChain } from "./registry";
import { getCachedAttestcoinEnvironment } from "./environment";

export type ProofRequestIntent = "live" | "preview";

export type ClassifiedProofRequest =
  | {
      kind: "live";
      sourceChain: AttestcoinSourceChainName;
      chainKey: number;
      environment: string;
    }
  | {
      kind: "preview";
      sourceChain: AttestcoinSourceChainName;
      chainKey: number | null;
      environment: string;
      reason: string;
    }
  | {
      kind: "reject";
      sourceChain: AttestcoinSourceChainName;
      chainKey: null;
      environment: string;
      reason: string;
    };

export function classifyProofRequest(input: {
  txHash?: string;
  sourceChain: AttestcoinSourceChainName;
  allowPreviewFallback?: boolean;
  intent?: ProofRequestIntent;
}): ClassifiedProofRequest {
  const environment = getCachedAttestcoinEnvironment();
  const resolved = resolveSourceChain(input.sourceChain, {
    environment,
  });
  const wantsLive =
    input.intent === "live" ||
    (input.intent !== "preview" && Boolean(input.txHash && isLiveTxHash(input.txHash)));

  if (!wantsLive) {
    return {
      kind: "preview",
      sourceChain: input.sourceChain,
      chainKey: resolved.chainKey,
      environment: environment.id,
      reason: "Preview adapter selected; live Attestcoin verification is not asserted.",
    };
  }

  const official = officialRegistry.getChain(environment.id, resolved.id);
  if (!resolved.liveProofEnabled || resolved.chainKey === null || !official) {
    return {
      kind: "reject",
      sourceChain: input.sourceChain,
      chainKey: null,
      environment: environment.id,
      reason: experimentalLiveProofMessage(input.sourceChain),
    };
  }

  return {
    kind: "live",
    sourceChain: input.sourceChain,
    chainKey: official.chainKey,
    environment: environment.id,
  };
}

export function liveProofAllowed(sourceChain: AttestcoinSourceChainName) {
  return classifyProofRequest({
    sourceChain,
    intent: "live",
    txHash: `0x${"a".repeat(64)}`,
  }).kind === "live";
}

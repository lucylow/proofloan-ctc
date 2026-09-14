import type { SourceChain, VerifiedFact } from "@shared/proofloan";
import { isMockEvidence } from "@shared/proofloan";
import { AttestcoinError } from "../attestcoin/errors";
import { DemoError, normalizeDemoError } from "./errors";
import { buildDemoFacts, generateDemoScenario } from "./generator";
import { loadDemoConfig, type DemoConfig } from "./config";
import type { DemoFallbackDecision, DemoProfileId } from "./types";

export type FallbackContext = {
  requestedMode: "live" | "preview";
  sourceChain: SourceChain;
  walletAddress: string;
  sourceTransactionHash?: string;
  profileId?: DemoProfileId;
};

export type FallbackResult = {
  facts: VerifiedFact[];
  decision: DemoFallbackDecision;
  scenarioId: string;
};

const FALLBACK_KINDS = new Set([
  "SOURCE_RPC",
  "PROOF_BUILDER",
  "TIMEOUT",
  "CIRCUIT_OPEN",
  "ATTESTATION_PENDING",
  "RATE_LIMITED",
]);

const FALLBACK_TOKENS = [
  "attestor",
  "proof builder",
  "proofworker",
  "rpc",
  "timeout",
  "network",
  "unavailable",
  "not configured",
];

export function canUseDemoFallback(
  error: unknown,
  profileId?: DemoProfileId,
  config: DemoConfig = loadDemoConfig(),
): boolean {
  try {
    if (!config.enabled || !config.allowLiveFailureFallback) return false;
    if (profileId) return true;
    if (error instanceof AttestcoinError) return FALLBACK_KINDS.has(error.kind);
    const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
    return FALLBACK_TOKENS.some(token => message.includes(token));
  } catch {
    return false;
  }
}

export function fallbackToDemo(context: FallbackContext, reason: string): FallbackResult {
  try {
    if (!context.sourceChain || typeof context.walletAddress !== "string" || context.walletAddress.trim() === "") {
      throw new DemoError("VALIDATION", "Demo fallback requires a source chain and wallet address.");
    }
    const profileId = context.profileId ?? "balanced-borrower";
    const scenario = generateDemoScenario(profileId);
    const facts = buildDemoFacts(profileId);
    if (!facts.length || !facts.every(isMockEvidence)) {
      throw new DemoError("GENERATION", "Demo fallback refused to admit unlabeled or empty facts.");
    }
    return {
      facts,
      scenarioId: scenario.scenarioId,
      decision: {
        used: true,
        reason: reason.trim() || "Live provider failed; synthetic demo facts were used.",
        provider: "ProofLoan deterministic demo generator",
        scenarioId: scenario.scenarioId,
      },
    };
  } catch (error) {
    throw normalizeDemoError(error);
  }
}

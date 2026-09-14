import type { FeatureVector, VerifiedFact } from "@shared/proofloan";
import { AI_MAX_FACTS, AI_MAX_LEVERAGE, AI_MAX_VOLUME, AI_MAX_WALLET_AGE_DAYS, AI_MAX_REQUEST_ID_LENGTH } from "./constants";
import { AiError } from "./errors";
import type { AiRequest } from "./aiTypes";

export function isFiniteNonNegative(value: number): boolean { return Number.isFinite(value) && value >= 0; }

export function isValidIsoTimestamp(value: string): boolean {
  return typeof value === "string" && Number.isFinite(Date.parse(value));
}

export function validateFeatureVector(features: FeatureVector): string[] {
  const errors: string[] = [];
  if (!features || typeof features !== "object") return ["features: missing feature vector"];
  for (const [key, value] of Object.entries(features)) if (typeof value !== "number" || !isFiniteNonNegative(value)) errors.push(`${key}: must be finite and non-negative`);
  if (features.repaymentCount % 1 !== 0 || features.latePayments % 1 !== 0 || features.evidenceCount % 1 !== 0) errors.push("counts must be integers");
  if (features.walletAgeDays > AI_MAX_WALLET_AGE_DAYS) errors.push("walletAgeDays exceeds configured bound");
  if (features.leverageRatio > AI_MAX_LEVERAGE) errors.push("leverageRatio exceeds configured bound");
  for (const k of ["volume7d", "volume30d", "volume180d"] as const) if (features[k] > AI_MAX_VOLUME) errors.push(`${k} exceeds configured bound`);
  if (features.freshnessScore > 1) errors.push("freshnessScore must be <= 1");
  return errors;
}

export function validateFacts(facts: VerifiedFact[]): string[] {
  const errors: string[] = [];
  if (!Array.isArray(facts)) return ["facts: expected an array"];
  if (facts.length > AI_MAX_FACTS) errors.push(`too many facts: ${facts.length}`);
  for (const fact of facts) {
    if (!fact || typeof fact !== "object") {
      errors.push("fact: missing object");
      continue;
    }
    if (!fact.id || typeof fact.id !== "string") errors.push("fact: missing id");
    if (!fact.proofRoot || fact.proofRoot.length < 8) errors.push(`${fact.id ?? "fact"}: missing proofRoot`);
    if (!Number.isFinite(fact.sourceBlock) || !Number.isFinite(fact.verificationBlock)) errors.push(`${fact.id ?? "fact"}: block numbers must be finite`);
    if (fact.verificationBlock < fact.sourceBlock) errors.push(`${fact.id}: verification block precedes source block`);
    if (!isValidIsoTimestamp(fact.observedAt)) errors.push(`${fact.id ?? "fact"}: observedAt is not a valid timestamp`);
    if (!isValidIsoTimestamp(fact.verifiedAt)) errors.push(`${fact.id ?? "fact"}: verifiedAt is not a valid timestamp`);
    if (fact.freshness === "Stale" && !fact.observedAt) errors.push(`${fact.id}: stale fact missing observedAt`);
  }
  return errors;
}

export function validateAiRequest(input: AiRequest): string[] {
  const errors: string[] = [];
  if (!input || typeof input !== "object") return ["request: missing AI request payload"];
  if (typeof input.walletAddress !== "string" || input.walletAddress.trim().length === 0) errors.push("walletAddress: required");
  if (typeof input.requestId === "string" && input.requestId.length > AI_MAX_REQUEST_ID_LENGTH) errors.push("requestId: exceeds configured bound");
  if (input.nowMs !== undefined && !Number.isFinite(input.nowMs)) errors.push("nowMs: must be finite");
  errors.push(...validateFeatureVector(input.features));
  errors.push(...validateFacts(input.facts));
  return errors;
}

export function assertValidAiRequest(input: AiRequest): void {
  const errors = validateAiRequest(input);
  if (errors.length) throw new AiError("VALIDATION", `AI input validation failed: ${errors.join("; ")}`);
}

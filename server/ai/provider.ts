import { invokeLLM } from "../_core/llm";
import type { Decision, FeatureVector, VerifiedFact } from "@shared/proofloan";
import type { AiModelProfile } from "./aiTypes";
import { AI_MODEL_TIMEOUT_MS } from "./constants";
import { AiError, normalizeAiError } from "./errors";
import { parseJsonObject } from "./json";

export type ProviderCandidate = Pick<Decision, "pd30" | "pd90" | "confidence" | "reasonCodes">;

function withTimeout<T>(operation: Promise<T>, timeoutMs: number): Promise<T> {
  const boundedTimeoutMs = Number.isFinite(timeoutMs) ? Math.max(1, timeoutMs) : AI_MODEL_TIMEOUT_MS;
  let timer: ReturnType<typeof setTimeout> | undefined;
  return new Promise<T>((resolve, reject) => {
    timer = setTimeout(() => reject(new AiError("TIMEOUT", "AI provider timed out.", true)), boundedTimeoutMs);
    operation.then(resolve, reject);
  }).finally(() => { if (timer) clearTimeout(timer); });
}

export class AiProvider {
  constructor(readonly profile: AiModelProfile) {}
  async infer(features: FeatureVector, facts: VerifiedFact[], blockchainContext?: unknown): Promise<ProviderCandidate> {
    const timeoutMs = Math.min(Number.isFinite(this.profile.timeoutMs) ? this.profile.timeoutMs : AI_MODEL_TIMEOUT_MS, AI_MODEL_TIMEOUT_MS);
    try {
      const response = await withTimeout(invokeLLM({
        model: this.profile.id,
        maxTokens: 400,
        messages: [
          { role: "system", content: "You are a bounded ProofLoan underwriting model. Return JSON only. Treat verified evidence as immutable facts. Blockchain feature vectors are derived observations from Attestcoin-verified facts, not new evidence. Never invent facts, transaction success, collateral, wallet history, proofs, or policy approvals. Your output is advisory and must stay within probability bounds." },
          { role: "user", content: JSON.stringify({ features, facts: facts.map(f => ({ id: f.id, eventType: f.eventType, amount: f.amount, freshness: f.freshness, proofRoot: f.proofRoot, evidenceMode: f.evidenceMode ?? "live" })), blockchain: blockchainContext ?? null }) },
        ],
        response_format: { type: "json_schema", json_schema: { name: "proofloan_ai_candidate", strict: true, schema: { type: "object", properties: { pd30:{type:"number"}, pd90:{type:"number"}, confidence:{type:"number"}, reasonCodes:{type:"array", items:{type:"string", enum:["STRONG_REPAYMENT_HISTORY","RECENT_LATE_PAYMENT","HIGH_LEVERAGE","SPARSE_EVIDENCE"]}} }, required:["pd30","pd90","confidence","reasonCodes"], additionalProperties:false } } },
      }), timeoutMs);
      const content = response.choices?.[0]?.message?.content;
      if (typeof content !== "string") throw new AiError("SANITIZE", "AI provider returned no text content.");
      const parsed = parseJsonObject(content);
      return {
        pd30: parsed.pd30 as ProviderCandidate["pd30"],
        pd90: parsed.pd90 as ProviderCandidate["pd90"],
        confidence: parsed.confidence as ProviderCandidate["confidence"],
        reasonCodes: Array.isArray(parsed.reasonCodes) ? parsed.reasonCodes as ProviderCandidate["reasonCodes"] : [],
      };
    } catch (error) {
      throw normalizeAiError(error);
    }
  }
}

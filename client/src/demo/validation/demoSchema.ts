import { z } from "zod";
import type { DemoDataSet } from "../types";
import { normalizeAppError, ProofLoanAppError } from "@/hardening/appError";
import type { Result } from "@/hardening/types";

const applicationSchema = z.object({
  id: z.string().min(3),
  borrowerLabel: z.string().min(1),
  amount: z.number().finite().nonnegative(),
  currency: z.string().min(2),
  requestedTermDays: z.number().int().positive(),
  state: z.string().min(1),
  riskTier: z.enum(["A", "B", "C", "D", "E"]),
  confidence: z.number().min(0).max(100),
  createdAt: z.string(),
  updatedAt: z.string(),
  evidenceCount: z.number().int().nonnegative(),
  evidenceFreshness: z.number().min(0).max(100),
  repaymentHistory: z.number().int().nonnegative(),
  leverageRatio: z.number().min(0).max(1),
  loanToValue: z.number().min(0).max(1),
  walletAgeDays: z.number().int().nonnegative(),
  decisionHash: z.string(),
  policyHash: z.string(),
  modelVersion: z.string(),
  featureVersion: z.string(),
});

const evidenceSchema = z.object({
  id: z.string().min(2),
  applicationId: z.string().min(3),
  chain: z.string().min(1),
  chainId: z.number().int().positive(),
  type: z.string().min(1),
  amount: z.number().finite().nonnegative().optional(),
  currency: z.string().optional(),
  sourceTransaction: z.string().min(1),
  blockNumber: z.number().int().nonnegative(),
  timestamp: z.string(),
  freshness: z.enum(["Fresh", "Aging", "Stale", "Unknown"]),
  verifier: z.string().min(1),
  confidence: z.number().min(0).max(100),
  verified: z.boolean(),
});

const decisionSchema = z.object({
  id: z.string(),
  applicationId: z.string(),
  riskTier: z.enum(["A", "B", "C", "D", "E"]),
  probability30d: z.number().min(0).max(100),
  probability90d: z.number().min(0).max(100),
  confidence: z.number().min(0).max(100),
  modelVersion: z.string(),
  featureVersion: z.string(),
  policyHash: z.string(),
  generatedAt: z.string(),
  reasons: z.array(z.object({
    code: z.string(),
    label: z.string(),
    severity: z.enum(["positive", "neutral", "negative"]),
    contribution: z.number().finite(),
  })),
  policyChecks: z.object({
    amount: z.boolean(),
    ltv: z.boolean(),
    freshness: z.boolean(),
    confidence: z.boolean(),
    liquidity: z.boolean(),
  }),
});

const offerSchema = z.object({
  id: z.string(),
  applicationId: z.string(),
  amount: z.number().finite().nonnegative(),
  apr: z.number().min(0).max(100),
  ltv: z.number().min(0).max(1),
  termDays: z.number().int().positive(),
  fee: z.number().finite().nonnegative(),
  currency: z.string(),
  status: z.enum(["Ready", "Expiring", "Unavailable", "Accepted", "Executed"]),
  expiresAt: z.string(),
  pool: z.string(),
  policyVersion: z.string(),
  riskTier: z.enum(["A", "B", "C", "D", "E"]),
  featured: z.boolean().optional(),
});

export function validateDemoData(data: unknown): Result<DemoDataSet> {
  try {
    if (!data || typeof data !== "object") throw new Error("Demo data is not an object");
    const object = data as DemoDataSet;

    for (const application of object.applications ?? []) applicationSchema.parse(application);
    for (const item of object.evidence ?? []) evidenceSchema.parse(item);
    for (const item of object.decisions ?? []) decisionSchema.parse(item);
    for (const item of object.offers ?? []) offerSchema.parse(item);

    return { ok: true, value: object };
  } catch (error) {
    return {
      ok: false,
      error: normalizeAppError(new ProofLoanAppError({
        code: "DEMO_DATA_INVALID",
        message: error instanceof Error ? error.message : "Invalid demo payload",
        source: "demo",
        recoverable: true,
      })),
    };
  }
}

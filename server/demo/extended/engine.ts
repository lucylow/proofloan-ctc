import { isReasonCode, type ReasonCode } from "@shared/proofloan";
import { evaluateRiskGuard } from "../../underwriting";
import { DemoError, isFiniteTimestamp } from "../errors";
import { getExtendedCase } from "./catalog";
import { materializeCase } from "./factory";

export type ExtendedDemoDecision = {
  status: "Ready" | "Blocked" | "Abstain";
  riskTier: "A" | "B" | "C" | "D";
  pd30: number;
  pd90: number;
  confidence: number;
  reasons: string[];
  policyStatus: "Ready" | "Blocked";
};

export function evaluateExtendedCase(id: string, nowMs = Date.now()): ExtendedDemoDecision {
  if (!isFiniteTimestamp(nowMs)) {
    throw new DemoError("VALIDATION", "Extended demo evaluation requires a finite timestamp.");
  }
  try {
    const spec = getExtendedCase(id);
    const materialized = materializeCase(spec, nowMs);
    const { features } = materialized;
    const pd30 = Math.min(0.95, Math.max(0.01,
      0.10
      + features.latePayments * 0.10
      + features.leverageRatio * 0.12
      + (features.evidenceCount < 2 ? 0.12 : 0)
      + (features.freshnessScore < 0.55 ? 0.10 : 0)
      - features.repaymentCount * 0.028,
    ));
    const pd90 = Math.min(0.99, Math.max(pd30, pd30 + 0.07));
    const confidence = Math.max(0.20, Math.min(0.99,
      0.60 + Math.min(0.28, features.evidenceCount * 0.06) + features.freshnessScore * 0.10,
    ));
    if (!Number.isFinite(pd30) || !Number.isFinite(pd90) || pd30 > pd90 || !Number.isFinite(confidence)) {
      throw new DemoError("SCORING", `Extended demo case ${id} produced a non-canonical score.`);
    }
    const reasons = [
      ...(features.repaymentCount >= 2 ? ["STRONG_REPAYMENT_HISTORY"] : []),
      ...(features.latePayments > 0 ? ["RECENT_LATE_PAYMENT"] : []),
      ...(features.leverageRatio > 0.80 ? ["HIGH_LEVERAGE"] : []),
      ...(features.evidenceCount < 2 ? ["SPARSE_EVIDENCE"] : []),
      ...(features.freshnessScore < 0.55 ? ["STALE_EVIDENCE"] : []),
    ];
    const reasonCodes = reasons.filter(isReasonCode) as ReasonCode[];
    const riskTier = pd30 < 0.10 ? "A" : pd30 < 0.20 ? "B" : pd30 < 0.34 ? "C" : "D";
    const abstain = spec.expectations.requireAbstention || confidence < 0.45 || features.evidenceCount === 0;
    if (abstain) {
      return {
        status: "Abstain",
        riskTier,
        pd30,
        pd90,
        confidence,
        reasons: [...reasons, "INSUFFICIENT_CONFIDENCE"],
        policyStatus: "Blocked",
      };
    }
    const policy = evaluateRiskGuard({
      pd30,
      pd90,
      confidence,
      freshnessScore: features.freshnessScore,
      riskTier,
      reasonCodes,
      modelVersion: "proofloan-demo-extended-v2",
      featureVersion: "feature-vector-v0.1.0",
      evidenceRoot: "mock",
      policyHash: "riskguard-policy-v0.1.0:demo-extended",
      decisionHash: `mock:${id}`,
    }, 1500);
    const blocked = spec.expectations.requirePolicyBlock || policy.status === "Blocked";
    return {
      status: blocked ? "Blocked" : "Ready",
      riskTier,
      pd30,
      pd90,
      confidence,
      reasons,
      policyStatus: blocked ? "Blocked" : "Ready",
    };
  } catch (error) {
    if (error instanceof DemoError) throw error;
    throw new DemoError("SCORING", `Extended demo case ${id} could not be evaluated.`, false, error);
  }
}

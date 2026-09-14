import type { FeatureVector, VerifiedFact } from "@shared/proofloan";
import { shortHash } from "./fingerprint";

const amount = (value: string): number => {
  const parsed = Number.parseFloat(String(value ?? "").replace(/[^0-9.-]/g, ""));
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
};

const ageDays = (fact: VerifiedFact, nowMs: number): number => {
  const observedMs = Date.parse(fact.observedAt);
  if (!Number.isFinite(observedMs) || !Number.isFinite(nowMs)) return 0;
  return Math.max(0, (nowMs - observedMs) / 86_400_000);
};

export type FeatureSummary = FeatureVector & {
  repaymentRatio: number;
  lateRatio: number;
  collateralCoverage: number;
  activityVelocity7d: number;
  evidenceFreshness: number;
  chainDiversity: number;
  eventDiversity: number;
  featureFingerprint: string;
};

export function deriveAdvancedFeatures(facts: VerifiedFact[], nowMs = Date.now()): FeatureSummary {
  const safeFacts = Array.isArray(facts) ? facts : [];
  const safeNowMs = Number.isFinite(nowMs) ? nowMs : Date.now();
  const repayments = safeFacts.filter(f => f.eventType === "REPAYMENT");
  const late = safeFacts.filter(f => f.eventType === "LATE_PAYMENT");
  const collateral = safeFacts.filter(f => f.eventType === "COLLATERAL_DEPOSIT");
  const totalRepayment = repayments.reduce((s, f) => s + amount(f.amount), 0);
  const totalCollateral = collateral.reduce((s, f) => s + amount(f.amount), 0);
  const volume = (days: number) => safeFacts.filter(f => ageDays(f, safeNowMs) <= days).reduce((s, f) => s + amount(f.amount), 0);
  const freshness = safeFacts.length ? safeFacts.reduce((s, f) => s + (f.freshness === "Fresh" ? 1 : f.freshness === "Aging" ? 0.75 : 0.2), 0) / safeFacts.length : 0;
  const chains = new Set(safeFacts.map(f => f.chain));
  const events = new Set(safeFacts.map(f => f.eventType));
  const ages = safeFacts.map(f => ageDays(f, safeNowMs)).filter(value => Number.isFinite(value));
  const base: FeatureVector = {
    repaymentCount: repayments.length,
    latePayments: late.length,
    leverageRatio: Number(Math.min(totalRepayment / Math.max(totalCollateral, 1), 100).toFixed(6)),
    walletAgeDays: ages.length ? Math.max(...ages) : 0,
    volume7d: volume(7),
    volume30d: volume(30),
    volume180d: volume(180),
    evidenceCount: safeFacts.length,
    freshnessScore: Number(freshness.toFixed(6)),
  };
  const summary = {
    ...base,
    repaymentRatio: repayments.length / Math.max(safeFacts.length, 1),
    lateRatio: late.length / Math.max(safeFacts.length, 1),
    collateralCoverage: totalCollateral / Math.max(totalRepayment, 1),
    activityVelocity7d: volume(7) / Math.max(volume(30), 1),
    evidenceFreshness: freshness,
    chainDiversity: Math.min(1, chains.size / 4),
    eventDiversity: Math.min(1, events.size / 3),
  };
  return { ...summary, featureFingerprint: shortHash(summary, 24) };
}

export function canonicalFeatureVector(features: FeatureSummary): FeatureVector {
  return {
    repaymentCount: features.repaymentCount,
    latePayments: features.latePayments,
    leverageRatio: features.leverageRatio,
    walletAgeDays: features.walletAgeDays,
    volume7d: features.volume7d,
    volume30d: features.volume30d,
    volume180d: features.volume180d,
    evidenceCount: features.evidenceCount,
    freshnessScore: features.freshnessScore,
  };
}

import type { Decision, FeatureVector, VerifiedFact } from "@shared/proofloan";

export type AiStage = "validate" | "normalize" | "engineer" | "score" | "explain" | "calibrate" | "policy" | "audit";
export type AiRiskMode = "advisory" | "bounded-autonomous" | "shadow";
export type AiProviderStatus = "available" | "degraded" | "disabled";
export type AiReason = { code: string; weight: number; direction: "positive" | "negative" | "neutral"; text: string };
export type AiEvidenceLink = { factId: string; field: string; contribution: number; proofRoot: string };
export type AiUncertainty = {
  aleatoric: number;
  epistemic: number;
  total: number;
  evidenceCoverage: number;
  staleEvidencePenalty: number;
};
export type AiCalibrationBucket = { lower: number; upper: number; predicted: number; observed: number; samples: number };
export type AiDriftReport = {
  feature: keyof FeatureVector;
  baselineMean: number;
  currentMean: number;
  absoluteShift: number;
  relativeShift: number;
  severity: "low" | "medium" | "high";
};
export type AiDecisionEnvelope = {
  decision: Decision;
  baselineDecision: Decision;
  uncertainty: AiUncertainty;
  reasons: AiReason[];
  evidenceLinks: AiEvidenceLink[];
  stages: Array<{ stage: AiStage; startedAt: string; finishedAt: string; ok: boolean; detail?: string }>;
  abstained: boolean;
  abstainReason?: string;
  mode: AiRiskMode;
  provider: string;
  modelVersion: string;
  featureVersion: string;
  policyHash: string;
  requestId: string;
  inputFingerprint: string;
  outputFingerprint: string;
};
export type AiModelProfile = {
  id: string;
  version: string;
  provider: string;
  status: AiProviderStatus;
  maxPd30: number;
  maxPd90: number;
  minConfidence: number;
  temperature: number;
  timeoutMs: number;
  featureVersion: string;
  policyHash: string;
};
export type AiAuditEvent = { id: string; requestId: string; stage: AiStage; type: string; timestamp: string; payloadHash: string; safeDetail: string };
export type AiRequest = {
  requestId: string;
  walletAddress: string;
  features: FeatureVector;
  facts: VerifiedFact[];
  mode?: AiRiskMode;
  modelId?: string;
  nowMs?: number;
};
export type AiBatchResult = {
  envelopes: AiDecisionEnvelope[];
  failures?: Array<{ requestId: string; code: string; message: string }>;
  aggregate: { count: number; abstained: number; avgConfidence: number; avgPd30: number; avgPd90: number };
};
export type AiCounterfactual = { name: string; feature: keyof FeatureVector; delta: number; decisionBefore: Decision; decisionAfter: Decision; pd30Delta: number; riskTierChanged: boolean };
export type AiEvaluationCase = { id: string; features: FeatureVector; expectedRiskTier: Decision["riskTier"]; expectedPd30Max: number; expectedReasons?: string[] };
export type AiEvaluationReport = { passed: number; failed: number; score: number; cases: Array<{ id: string; passed: boolean; detail: string }> };

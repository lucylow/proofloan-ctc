import { heroScenario } from "./hero";
import { strong_repaymentScenario } from "./strong-repayment";
import { cross_chain_wealthScenario } from "./cross-chain-wealth";
import { recent_late_paymentScenario } from "./recent-late-payment";
import { high_leverageScenario } from "./high-leverage";
import { sparse_evidenceScenario } from "./sparse-evidence";
import { fresh_evidenceScenario } from "./fresh-evidence";
import { aging_evidenceScenario } from "./aging-evidence";
import { stale_evidenceScenario } from "./stale-evidence";
import { proof_delayedScenario } from "./proof-delayed";
import { proof_rejectedScenario } from "./proof-rejected";
import { partial_attestationScenario } from "./partial-attestation";
import { multi_chainScenario } from "./multi-chain";
import { new_walletScenario } from "./new-wallet";
import { high_riskScenario } from "./high-risk";
import { mixed_signalsScenario } from "./mixed-signals";
import { collateral_heavyScenario } from "./collateral-heavy";
import { stable_activityScenario } from "./stable-activity";
import { volatile_activityScenario } from "./volatile-activity";
import { low_liquidityScenario } from "./low-liquidity";
import { recoveryScenario } from "./recovery";
import { judgeScenario } from "./judge";

import type { AiDashboardSnapshot, AiMockDatasetStats, AiMockScenarioId, AiScenario } from "@shared/aiMockTypes";
import { stableHash } from "./helpers";

export const AI_MOCK_SCENARIOS: Record<AiMockScenarioId, AiScenario> = {
  'hero': heroScenario,
  'strong-repayment': strong_repaymentScenario,
  'cross-chain-wealth': cross_chain_wealthScenario,
  'recent-late-payment': recent_late_paymentScenario,
  'high-leverage': high_leverageScenario,
  'sparse-evidence': sparse_evidenceScenario,
  'fresh-evidence': fresh_evidenceScenario,
  'aging-evidence': aging_evidenceScenario,
  'stale-evidence': stale_evidenceScenario,
  'proof-delayed': proof_delayedScenario,
  'proof-rejected': proof_rejectedScenario,
  'partial-attestation': partial_attestationScenario,
  'multi-chain': multi_chainScenario,
  'new-wallet': new_walletScenario,
  'high-risk': high_riskScenario,
  'mixed-signals': mixed_signalsScenario,
  'collateral-heavy': collateral_heavyScenario,
  'stable-activity': stable_activityScenario,
  'volatile-activity': volatile_activityScenario,
  'low-liquidity': low_liquidityScenario,
  'recovery': recoveryScenario,
  'judge': judgeScenario
};

export function listAiMockScenarios(): AiScenario[] {
  return Object.values(AI_MOCK_SCENARIOS);
}

export function getAiMockScenario(id: AiMockScenarioId): AiScenario {
  return AI_MOCK_SCENARIOS[id];
}

export function buildAiMockStats(): AiMockDatasetStats {
  const scenarios = listAiMockScenarios();
  const facts = scenarios.flatMap(s => s.facts);
  return {
    scenarios: scenarios.length,
    facts: facts.length,
    repayments: facts.filter(f => f.eventType === "REPAYMENT").length,
    collateralDeposits: facts.filter(f => f.eventType === "COLLATERAL_DEPOSIT").length,
    latePayments: facts.filter(f => f.eventType === "LATE_PAYMENT").length,
    chains: new Set(facts.map(f => f.chain)).size,
    recommendations: {
      APPROVE: scenarios.filter(s => s.recommendation === "APPROVE").length,
      REVIEW: scenarios.filter(s => s.recommendation === "REVIEW").length,
      REJECT: scenarios.filter(s => s.recommendation === "REJECT").length,
    },
  };
}

export function buildAiDashboardSnapshot(id: AiMockScenarioId): AiDashboardSnapshot {
  const scenario = getAiMockScenario(id);
  const features = scenario.features;
  const whatIf = [
    { label: "One more repayment", changedFeature: "repaymentCount", baseline: features.repaymentCount, counterfactual: features.repaymentCount + 1 },
    { label: "One late payment removed", changedFeature: "latePayments", baseline: features.latePayments, counterfactual: Math.max(0, features.latePayments - 1) },
    { label: "Freshness improves", changedFeature: "freshnessScore", baseline: features.freshnessScore, counterfactual: Number(Math.min(1, features.freshnessScore + 0.2).toFixed(2)) },
  ].map(item => {
    const pseudo = { ...features, [item.changedFeature]: item.counterfactual } as typeof features;
    const baseRisk = scenario.decision.pd90;
    const adjustment = item.changedFeature === "latePayments" ? -0.04 : item.changedFeature === "repaymentCount" ? -0.03 : -0.02;
    const confidence = Math.min(0.99, scenario.decision.confidence + 0.02);
    const recommendation = baseRisk + adjustment < 0.2 ? "APPROVE" : baseRisk + adjustment > 0.62 ? "REJECT" : "REVIEW";
    void pseudo;
    return { ...item, recommendation: recommendation as "APPROVE" | "REVIEW" | "REJECT", confidence };
  });
  return {
    scenarioId: id,
    modelVersion: scenario.decision.modelVersion,
    scenario,
    recommendation: scenario.recommendation,
    confidenceBand: scenario.confidenceBand,
    featureContributions: scenario.modelExplanation,
    narrative: scenario.narrative,
    featureDrift: Object.fromEntries(Object.entries(features).filter(([, value]) => typeof value === "number").map(([key, value]) => [key, Number(((value as number) * 0.03).toFixed(4))])),
    whatIf,
  };
}

export const AI_MOCK_DATASET_HASH = stableHash(listAiMockScenarios().map(s => ({ id: s.id, decision: s.decision.decisionHash, facts: s.facts.map(f => f.id) })));

import type { AiScenario } from "@shared/aiMockTypes";
import { featuresFromFacts, makeDecision, makeFacts, makeWallet, AI_MOCK_GENERATED_AT } from "./helpers";

const walletAddress = makeWallet('judge');
const facts = [
  makeFacts('judge', 'Ethereum Sepolia', [['REPAYMENT', 1250, 2],['COLLATERAL_DEPOSIT', 5000, 10],['REPAYMENT', 1180, 45]]),
  makeFacts('judge', 'Polygon Amoy', [['REPAYMENT', 1450, 8],['REPAYMENT', 1320, 20]])
];
const featureFacts = facts.flat();
const features = featuresFromFacts(featureFacts, 1100);
const result = makeDecision(features, featureFacts);

export const judgeScenario: AiScenario = {
  id: 'judge',
  title: 'Judge-ready audit trail',
  description: 'Complete demo scenario optimized for explaining evidence, model output, and policy boundaries.',
  walletAddress,
  sourceChains: ['Ethereum Sepolia', 'Polygon Amoy'],
  facts: featureFacts,
  features,
  decision: result.decision,
  recommendation: result.recommendation,
  confidenceBand: result.decision.confidence >= 0.9 ? "very-high" : result.decision.confidence >= 0.75 ? "high" : result.decision.confidence >= 0.55 ? "medium" : result.decision.confidence >= 0.35 ? "low" : "very-low",
  modelExplanation: result.explanations,
  narrative: {
    summary: 'Complete demo scenario optimized for explaining evidence, model output, and policy boundaries.',
    strengths: result.explanations.filter(item => item.direction === "positive").map(item => item.explanation),
    concerns: result.explanations.filter(item => item.direction === "negative").map(item => item.explanation),
    evidenceChain: featureFacts.slice(0, 5).map(f => `${f.eventType} on ${f.chain} · ${f.amount} · ${f.freshness}`),
    actionRationale: `AI recommendation is ${result.recommendation}; downstream RiskGuard remains the policy authority.`,
    disclaimer: "Mock/demo data only. AI interpretation is advisory and must not be treated as a source of truth.",
  },
  failureMode: 'none',
  proofLatencyMs: 1500,
  generatedAt: AI_MOCK_GENERATED_AT,
  tags: ['judge', 'audit', 'presentation'],
};

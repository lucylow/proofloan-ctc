import type { AiScenario } from "@shared/aiMockTypes";
import { featuresFromFacts, makeDecision, makeFacts, makeWallet, AI_MOCK_GENERATED_AT } from "./helpers";

const walletAddress = makeWallet('volatile-activity');
const facts = [
  makeFacts('volatile-activity', 'Polygon Amoy', [['REPAYMENT', 300, 3],['REPAYMENT', 5000, 8],['REPAYMENT', 250, 14],['COLLATERAL_DEPOSIT', 1800, 10]])
];
const featureFacts = facts.flat();
const features = featuresFromFacts(featureFacts, 610);
const result = makeDecision(features, featureFacts);

export const volatile_activityScenario: AiScenario = {
  id: 'volatile-activity',
  title: 'Volatile activity',
  description: 'Large changes in transaction size introduce uncertainty.',
  walletAddress,
  sourceChains: ['Polygon Amoy'],
  facts: featureFacts,
  features,
  decision: result.decision,
  recommendation: result.recommendation,
  confidenceBand: result.decision.confidence >= 0.9 ? "very-high" : result.decision.confidence >= 0.75 ? "high" : result.decision.confidence >= 0.55 ? "medium" : result.decision.confidence >= 0.35 ? "low" : "very-low",
  modelExplanation: result.explanations,
  narrative: {
    summary: 'Large changes in transaction size introduce uncertainty.',
    strengths: result.explanations.filter(item => item.direction === "positive").map(item => item.explanation),
    concerns: result.explanations.filter(item => item.direction === "negative").map(item => item.explanation),
    evidenceChain: featureFacts.slice(0, 5).map(f => `${f.eventType} on ${f.chain} · ${f.amount} · ${f.freshness}`),
    actionRationale: `AI recommendation is ${result.recommendation}; downstream RiskGuard remains the policy authority.`,
    disclaimer: "Mock/demo data only. AI interpretation is advisory and must not be treated as a source of truth.",
  },
  failureMode: 'none',
  proofLatencyMs: 1380,
  generatedAt: AI_MOCK_GENERATED_AT,
  tags: ['volatile', 'review'],
};

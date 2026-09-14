import type { AiScenario } from "@shared/aiMockTypes";
import { featuresFromFacts, makeDecision, makeFacts, makeWallet, AI_MOCK_GENERATED_AT } from "./helpers";

const walletAddress = makeWallet('high-risk');
const facts = [
  makeFacts('high-risk', 'Polygon Amoy', [['LATE_PAYMENT', 900, 3],['LATE_PAYMENT', 700, 11],['REPAYMENT', 4200, 14],['COLLATERAL_DEPOSIT', 1600, 5]])
];
const featureFacts = facts.flat();
const features = featuresFromFacts(featureFacts, 460);
const result = makeDecision(features, featureFacts);

export const high_riskScenario: AiScenario = {
  id: 'high-risk',
  title: 'High risk',
  description: 'Multiple late payments and elevated leverage.',
  walletAddress,
  sourceChains: ['Polygon Amoy'],
  facts: featureFacts,
  features,
  decision: result.decision,
  recommendation: result.recommendation,
  confidenceBand: result.decision.confidence >= 0.9 ? "very-high" : result.decision.confidence >= 0.75 ? "high" : result.decision.confidence >= 0.55 ? "medium" : result.decision.confidence >= 0.35 ? "low" : "very-low",
  modelExplanation: result.explanations,
  narrative: {
    summary: 'Multiple late payments and elevated leverage.',
    strengths: result.explanations.filter(item => item.direction === "positive").map(item => item.explanation),
    concerns: result.explanations.filter(item => item.direction === "negative").map(item => item.explanation),
    evidenceChain: featureFacts.slice(0, 5).map(f => `${f.eventType} on ${f.chain} · ${f.amount} · ${f.freshness}`),
    actionRationale: `AI recommendation is ${result.recommendation}; downstream RiskGuard remains the policy authority.`,
    disclaimer: "Mock/demo data only. AI interpretation is advisory and must not be treated as a source of truth.",
  },
  failureMode: 'none',
  proofLatencyMs: 1380,
  generatedAt: AI_MOCK_GENERATED_AT,
  tags: ['high-risk', 'reject'],
};

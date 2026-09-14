import type { AiScenario } from "@shared/aiMockTypes";
import { featuresFromFacts, makeDecision, makeFacts, makeWallet, AI_MOCK_GENERATED_AT } from "./helpers";

const walletAddress = makeWallet('stable-activity');
const facts = [
  makeFacts('stable-activity', 'Ethereum Sepolia', [['REPAYMENT', 1000, 6],['REPAYMENT', 980, 18],['REPAYMENT', 1020, 30],['REPAYMENT', 990, 42],['COLLATERAL_DEPOSIT', 3200, 25]])
];
const featureFacts = facts.flat();
const features = featuresFromFacts(featureFacts, 860);
const result = makeDecision(features, featureFacts);

export const stable_activityScenario: AiScenario = {
  id: 'stable-activity',
  title: 'Stable activity',
  description: 'Evenly spaced activity suggests consistent behavior.',
  walletAddress,
  sourceChains: ['Ethereum Sepolia'],
  facts: featureFacts,
  features,
  decision: result.decision,
  recommendation: result.recommendation,
  confidenceBand: result.decision.confidence >= 0.9 ? "very-high" : result.decision.confidence >= 0.75 ? "high" : result.decision.confidence >= 0.55 ? "medium" : result.decision.confidence >= 0.35 ? "low" : "very-low",
  modelExplanation: result.explanations,
  narrative: {
    summary: 'Evenly spaced activity suggests consistent behavior.',
    strengths: result.explanations.filter(item => item.direction === "positive").map(item => item.explanation),
    concerns: result.explanations.filter(item => item.direction === "negative").map(item => item.explanation),
    evidenceChain: featureFacts.slice(0, 5).map(f => `${f.eventType} on ${f.chain} · ${f.amount} · ${f.freshness}`),
    actionRationale: `AI recommendation is ${result.recommendation}; downstream RiskGuard remains the policy authority.`,
    disclaimer: "Mock/demo data only. AI interpretation is advisory and must not be treated as a source of truth.",
  },
  failureMode: 'none',
  proofLatencyMs: 1500,
  generatedAt: AI_MOCK_GENERATED_AT,
  tags: ['stable', 'consistency'],
};

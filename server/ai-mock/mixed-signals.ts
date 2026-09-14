import type { AiScenario } from "@shared/aiMockTypes";
import { featuresFromFacts, makeDecision, makeFacts, makeWallet, AI_MOCK_GENERATED_AT } from "./helpers";

const walletAddress = makeWallet('mixed-signals');
const facts = [
  makeFacts('mixed-signals', 'Ethereum Sepolia', [['REPAYMENT', 1400, 5],['REPAYMENT', 1500, 18],['LATE_PAYMENT', 500, 22],['COLLATERAL_DEPOSIT', 2500, 30]])
];
const featureFacts = facts.flat();
const features = featuresFromFacts(featureFacts, 680);
const result = makeDecision(features, featureFacts);

export const mixed_signalsScenario: AiScenario = {
  id: 'mixed-signals',
  title: 'Mixed signals',
  description: 'Good repayment count but conflicting recency and leverage signals.',
  walletAddress,
  sourceChains: ['Ethereum Sepolia'],
  facts: featureFacts,
  features,
  decision: result.decision,
  recommendation: result.recommendation,
  confidenceBand: result.decision.confidence >= 0.9 ? "very-high" : result.decision.confidence >= 0.75 ? "high" : result.decision.confidence >= 0.55 ? "medium" : result.decision.confidence >= 0.35 ? "low" : "very-low",
  modelExplanation: result.explanations,
  narrative: {
    summary: 'Good repayment count but conflicting recency and leverage signals.',
    strengths: result.explanations.filter(item => item.direction === "positive").map(item => item.explanation),
    concerns: result.explanations.filter(item => item.direction === "negative").map(item => item.explanation),
    evidenceChain: featureFacts.slice(0, 5).map(f => `${f.eventType} on ${f.chain} · ${f.amount} · ${f.freshness}`),
    actionRationale: `AI recommendation is ${result.recommendation}; downstream RiskGuard remains the policy authority.`,
    disclaimer: "Mock/demo data only. AI interpretation is advisory and must not be treated as a source of truth.",
  },
  failureMode: 'none',
  proofLatencyMs: 1380,
  generatedAt: AI_MOCK_GENERATED_AT,
  tags: ['mixed', 'review'],
};

import type { AiScenario } from "@shared/aiMockTypes";
import { featuresFromFacts, makeDecision, makeFacts, makeWallet, AI_MOCK_GENERATED_AT } from "./helpers";

const walletAddress = makeWallet('strong-repayment');
const facts = [
  makeFacts('strong-repayment', 'Ethereum Sepolia', [['REPAYMENT', 900, 4],['REPAYMENT', 1200, 12],['REPAYMENT', 1500, 20],['REPAYMENT', 1000, 34],['COLLATERAL_DEPOSIT', 4200, 8]])
];
const featureFacts = facts.flat();
const features = featuresFromFacts(featureFacts, 900);
const result = makeDecision(features, featureFacts);

export const strong_repaymentScenario: AiScenario = {
  id: 'strong-repayment',
  title: 'Strong repayment history',
  description: 'Repeated verified repayments with no late events.',
  walletAddress,
  sourceChains: ['Ethereum Sepolia'],
  facts: featureFacts,
  features,
  decision: result.decision,
  recommendation: result.recommendation,
  confidenceBand: result.decision.confidence >= 0.9 ? "very-high" : result.decision.confidence >= 0.75 ? "high" : result.decision.confidence >= 0.55 ? "medium" : result.decision.confidence >= 0.35 ? "low" : "very-low",
  modelExplanation: result.explanations,
  narrative: {
    summary: 'Repeated verified repayments with no late events.',
    strengths: result.explanations.filter(item => item.direction === "positive").map(item => item.explanation),
    concerns: result.explanations.filter(item => item.direction === "negative").map(item => item.explanation),
    evidenceChain: featureFacts.slice(0, 5).map(f => `${f.eventType} on ${f.chain} · ${f.amount} · ${f.freshness}`),
    actionRationale: `AI recommendation is ${result.recommendation}; downstream RiskGuard remains the policy authority.`,
    disclaimer: "Mock/demo data only. AI interpretation is advisory and must not be treated as a source of truth.",
  },
  failureMode: 'none',
  proofLatencyMs: 1500,
  generatedAt: AI_MOCK_GENERATED_AT,
  tags: ['positive', 'approval'],
};

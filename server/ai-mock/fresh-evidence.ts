import type { AiScenario } from "@shared/aiMockTypes";
import { featuresFromFacts, makeDecision, makeFacts, makeWallet, AI_MOCK_GENERATED_AT } from "./helpers";

const walletAddress = makeWallet('fresh-evidence');
const facts = [
  makeFacts('fresh-evidence', 'Polygon Amoy', [['REPAYMENT', 800, 1],['REPAYMENT', 1200, 3],['COLLATERAL_DEPOSIT', 2600, 4],['REPAYMENT', 900, 8],['REPAYMENT', 700, 12]])
];
const featureFacts = facts.flat();
const features = featuresFromFacts(featureFacts, 390);
const result = makeDecision(features, featureFacts);

export const fresh_evidenceScenario: AiScenario = {
  id: 'fresh-evidence',
  title: 'Fresh evidence',
  description: 'Dense evidence observed over the last two weeks.',
  walletAddress,
  sourceChains: ['Polygon Amoy'],
  facts: featureFacts,
  features,
  decision: result.decision,
  recommendation: result.recommendation,
  confidenceBand: result.decision.confidence >= 0.9 ? "very-high" : result.decision.confidence >= 0.75 ? "high" : result.decision.confidence >= 0.55 ? "medium" : result.decision.confidence >= 0.35 ? "low" : "very-low",
  modelExplanation: result.explanations,
  narrative: {
    summary: 'Dense evidence observed over the last two weeks.',
    strengths: result.explanations.filter(item => item.direction === "positive").map(item => item.explanation),
    concerns: result.explanations.filter(item => item.direction === "negative").map(item => item.explanation),
    evidenceChain: featureFacts.slice(0, 5).map(f => `${f.eventType} on ${f.chain} · ${f.amount} · ${f.freshness}`),
    actionRationale: `AI recommendation is ${result.recommendation}; downstream RiskGuard remains the policy authority.`,
    disclaimer: "Mock/demo data only. AI interpretation is advisory and must not be treated as a source of truth.",
  },
  failureMode: 'none',
  proofLatencyMs: 1500,
  generatedAt: AI_MOCK_GENERATED_AT,
  tags: ['fresh', 'high-confidence'],
};

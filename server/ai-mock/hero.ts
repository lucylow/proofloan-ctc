import type { AiScenario } from "@shared/aiMockTypes";
import { featuresFromFacts, makeDecision, makeFacts, makeWallet, AI_MOCK_GENERATED_AT } from "./helpers";

const walletAddress = makeWallet('hero');
const facts = [
  makeFacts('hero', 'Ethereum Sepolia', [['REPAYMENT', 1250, 3],['COLLATERAL_DEPOSIT', 2800, 5],['REPAYMENT', 850, 21],['REPAYMENT', 1600, 48]])
];
const featureFacts = facts.flat();
const features = featuresFromFacts(featureFacts, 620);
const result = makeDecision(features, featureFacts);

export const heroScenario: AiScenario = {
  id: 'hero',
  title: 'Hero evidence file',
  description: 'Balanced, high-confidence cross-chain evidence for a clean demo path.',
  walletAddress,
  sourceChains: ['Ethereum Sepolia'],
  facts: featureFacts,
  features,
  decision: result.decision,
  recommendation: result.recommendation,
  confidenceBand: result.decision.confidence >= 0.9 ? "very-high" : result.decision.confidence >= 0.75 ? "high" : result.decision.confidence >= 0.55 ? "medium" : result.decision.confidence >= 0.35 ? "low" : "very-low",
  modelExplanation: result.explanations,
  narrative: {
    summary: 'Balanced, high-confidence cross-chain evidence for a clean demo path.',
    strengths: result.explanations.filter(item => item.direction === "positive").map(item => item.explanation),
    concerns: result.explanations.filter(item => item.direction === "negative").map(item => item.explanation),
    evidenceChain: featureFacts.slice(0, 5).map(f => `${f.eventType} on ${f.chain} · ${f.amount} · ${f.freshness}`),
    actionRationale: `AI recommendation is ${result.recommendation}; downstream RiskGuard remains the policy authority.`,
    disclaimer: "Mock/demo data only. AI interpretation is advisory and must not be treated as a source of truth.",
  },
  failureMode: 'none',
  proofLatencyMs: 1380,
  generatedAt: AI_MOCK_GENERATED_AT,
  tags: ['hero', 'demo', 'judge'],
};

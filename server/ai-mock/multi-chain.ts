import type { AiScenario } from "@shared/aiMockTypes";
import { featuresFromFacts, makeDecision, makeFacts, makeWallet, AI_MOCK_GENERATED_AT } from "./helpers";

const walletAddress = makeWallet('multi-chain');
const facts = [
  makeFacts('multi-chain', 'Ethereum Sepolia', [['REPAYMENT', 950, 4],['REPAYMENT', 1200, 16],['REPAYMENT', 900, 38]]),
  makeFacts('multi-chain', 'Polygon Amoy', [['REPAYMENT', 1050, 6],['COLLATERAL_DEPOSIT', 4500, 20]])
];
const featureFacts = facts.flat();
const features = featuresFromFacts(featureFacts, 980);
const result = makeDecision(features, featureFacts);

export const multi_chainScenario: AiScenario = {
  id: 'multi-chain',
  title: 'Multi-chain consistency',
  description: 'Activity on two networks is directionally consistent.',
  walletAddress,
  sourceChains: ['Ethereum Sepolia', 'Polygon Amoy'],
  facts: featureFacts,
  features,
  decision: result.decision,
  recommendation: result.recommendation,
  confidenceBand: result.decision.confidence >= 0.9 ? "very-high" : result.decision.confidence >= 0.75 ? "high" : result.decision.confidence >= 0.55 ? "medium" : result.decision.confidence >= 0.35 ? "low" : "very-low",
  modelExplanation: result.explanations,
  narrative: {
    summary: 'Activity on two networks is directionally consistent.',
    strengths: result.explanations.filter(item => item.direction === "positive").map(item => item.explanation),
    concerns: result.explanations.filter(item => item.direction === "negative").map(item => item.explanation),
    evidenceChain: featureFacts.slice(0, 5).map(f => `${f.eventType} on ${f.chain} · ${f.amount} · ${f.freshness}`),
    actionRationale: `AI recommendation is ${result.recommendation}; downstream RiskGuard remains the policy authority.`,
    disclaimer: "Mock/demo data only. AI interpretation is advisory and must not be treated as a source of truth.",
  },
  failureMode: 'none',
  proofLatencyMs: 1500,
  generatedAt: AI_MOCK_GENERATED_AT,
  tags: ['multi-chain', 'consistency'],
};

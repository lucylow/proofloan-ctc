import type { AiScenario } from "@shared/aiMockTypes";
import { featuresFromFacts, makeDecision, makeFacts, makeWallet, AI_MOCK_GENERATED_AT } from "./helpers";

const walletAddress = makeWallet('cross-chain-wealth');
const facts = [
  makeFacts('cross-chain-wealth', 'Ethereum Sepolia', [['REPAYMENT', 2200, 5],['COLLATERAL_DEPOSIT', 6000, 15]]),
  makeFacts('cross-chain-wealth', 'Polygon Amoy', [['REPAYMENT', 1800, 9],['REPAYMENT', 1300, 33]])
];
const featureFacts = facts.flat();
const features = featuresFromFacts(featureFacts, 760);
const result = makeDecision(features, featureFacts);

export const cross_chain_wealthScenario: AiScenario = {
  id: 'cross-chain-wealth',
  title: 'Cross-chain wealth',
  description: 'Evidence is distributed across Ethereum and Polygon with consistent activity.',
  walletAddress,
  sourceChains: ['Ethereum Sepolia', 'Polygon Amoy'],
  facts: featureFacts,
  features,
  decision: result.decision,
  recommendation: result.recommendation,
  confidenceBand: result.decision.confidence >= 0.9 ? "very-high" : result.decision.confidence >= 0.75 ? "high" : result.decision.confidence >= 0.55 ? "medium" : result.decision.confidence >= 0.35 ? "low" : "very-low",
  modelExplanation: result.explanations,
  narrative: {
    summary: 'Evidence is distributed across Ethereum and Polygon with consistent activity.',
    strengths: result.explanations.filter(item => item.direction === "positive").map(item => item.explanation),
    concerns: result.explanations.filter(item => item.direction === "negative").map(item => item.explanation),
    evidenceChain: featureFacts.slice(0, 5).map(f => `${f.eventType} on ${f.chain} · ${f.amount} · ${f.freshness}`),
    actionRationale: `AI recommendation is ${result.recommendation}; downstream RiskGuard remains the policy authority.`,
    disclaimer: "Mock/demo data only. AI interpretation is advisory and must not be treated as a source of truth.",
  },
  failureMode: 'none',
  proofLatencyMs: 1380,
  generatedAt: AI_MOCK_GENERATED_AT,
  tags: ['cross-chain', 'portfolio'],
};

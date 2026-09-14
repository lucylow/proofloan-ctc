import type { AiScenario } from "@shared/aiMockTypes";
import { featuresFromFacts, makeDecision, makeFacts, makeWallet, AI_MOCK_GENERATED_AT } from "./helpers";

const walletAddress = makeWallet('proof-rejected');
const facts = [
  makeFacts('proof-rejected', 'Ethereum Sepolia', [['REPAYMENT', 1700, 4],['COLLATERAL_DEPOSIT', 3000, 9]])
];
const featureFacts = facts.flat();
const features = featuresFromFacts(featureFacts, 600);
const result = makeDecision(features, featureFacts);

export const proof_rejectedScenario: AiScenario = {
  id: 'proof-rejected',
  title: 'Proof rejected',
  description: 'Malformed or invalid proof prevents trustworthy scoring.',
  walletAddress,
  sourceChains: ['Ethereum Sepolia'],
  facts: featureFacts,
  features,
  decision: result.decision,
  recommendation: result.recommendation,
  confidenceBand: result.decision.confidence >= 0.9 ? "very-high" : result.decision.confidence >= 0.75 ? "high" : result.decision.confidence >= 0.55 ? "medium" : result.decision.confidence >= 0.35 ? "low" : "very-low",
  modelExplanation: result.explanations,
  narrative: {
    summary: 'Malformed or invalid proof prevents trustworthy scoring.',
    strengths: result.explanations.filter(item => item.direction === "positive").map(item => item.explanation),
    concerns: result.explanations.filter(item => item.direction === "negative").map(item => item.explanation),
    evidenceChain: featureFacts.slice(0, 5).map(f => `${f.eventType} on ${f.chain} · ${f.amount} · ${f.freshness}`),
    actionRationale: `AI recommendation is ${result.recommendation}; downstream RiskGuard remains the policy authority.`,
    disclaimer: "Mock/demo data only. AI interpretation is advisory and must not be treated as a source of truth.",
  },
  failureMode: 'invalid_proof',
  proofLatencyMs: 1140,
  generatedAt: AI_MOCK_GENERATED_AT,
  tags: ['proof-failure', 'fail-safe'],
};

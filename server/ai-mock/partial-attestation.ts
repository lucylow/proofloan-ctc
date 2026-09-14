import type { AiScenario } from "@shared/aiMockTypes";
import { featuresFromFacts, makeDecision, makeFacts, makeWallet, AI_MOCK_GENERATED_AT } from "./helpers";

const walletAddress = makeWallet('partial-attestation');
const facts = [
  makeFacts('partial-attestation', 'Ethereum Sepolia', [['REPAYMENT', 1200, 6],['COLLATERAL_DEPOSIT', 2500, 12]]),
  makeFacts('partial-attestation', 'Polygon Amoy', [['REPAYMENT', 900, 17]])
];
const featureFacts = facts.flat();
const features = featuresFromFacts(featureFacts, 510);
const result = makeDecision(features, featureFacts);

export const partial_attestationScenario: AiScenario = {
  id: 'partial-attestation',
  title: 'Partial attestation',
  description: 'One chain is available while the second is still pending.',
  walletAddress,
  sourceChains: ['Ethereum Sepolia', 'Polygon Amoy'],
  facts: featureFacts,
  features,
  decision: result.decision,
  recommendation: result.recommendation,
  confidenceBand: result.decision.confidence >= 0.9 ? "very-high" : result.decision.confidence >= 0.75 ? "high" : result.decision.confidence >= 0.55 ? "medium" : result.decision.confidence >= 0.35 ? "low" : "very-low",
  modelExplanation: result.explanations,
  narrative: {
    summary: 'One chain is available while the second is still pending.',
    strengths: result.explanations.filter(item => item.direction === "positive").map(item => item.explanation),
    concerns: result.explanations.filter(item => item.direction === "negative").map(item => item.explanation),
    evidenceChain: featureFacts.slice(0, 5).map(f => `${f.eventType} on ${f.chain} · ${f.amount} · ${f.freshness}`),
    actionRationale: `AI recommendation is ${result.recommendation}; downstream RiskGuard remains the policy authority.`,
    disclaimer: "Mock/demo data only. AI interpretation is advisory and must not be treated as a source of truth.",
  },
  failureMode: 'attestation_pending',
  proofLatencyMs: 1260,
  generatedAt: AI_MOCK_GENERATED_AT,
  tags: ['partial', 'cross-chain'],
};

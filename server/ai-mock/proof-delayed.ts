import type { AiScenario } from "@shared/aiMockTypes";
import { featuresFromFacts, makeDecision, makeFacts, makeWallet, AI_MOCK_GENERATED_AT } from "./helpers";

const walletAddress = makeWallet('proof-delayed');
const facts = [
  makeFacts('proof-delayed', 'Ethereum Sepolia', [['REPAYMENT', 1500, 4],['COLLATERAL_DEPOSIT', 3400, 7],['REPAYMENT', 1100, 18]])
];
const featureFacts = facts.flat();
const features = featuresFromFacts(featureFacts, 730);
const result = makeDecision(features, featureFacts);

export const proof_delayedScenario: AiScenario = {
  id: 'proof-delayed',
  title: 'Proof delayed',
  description: 'Good underlying activity but proof generation is delayed.',
  walletAddress,
  sourceChains: ['Ethereum Sepolia'],
  facts: featureFacts,
  features,
  decision: result.decision,
  recommendation: result.recommendation,
  confidenceBand: result.decision.confidence >= 0.9 ? "very-high" : result.decision.confidence >= 0.75 ? "high" : result.decision.confidence >= 0.55 ? "medium" : result.decision.confidence >= 0.35 ? "low" : "very-low",
  modelExplanation: result.explanations,
  narrative: {
    summary: 'Good underlying activity but proof generation is delayed.',
    strengths: result.explanations.filter(item => item.direction === "positive").map(item => item.explanation),
    concerns: result.explanations.filter(item => item.direction === "negative").map(item => item.explanation),
    evidenceChain: featureFacts.slice(0, 5).map(f => `${f.eventType} on ${f.chain} · ${f.amount} · ${f.freshness}`),
    actionRationale: `AI recommendation is ${result.recommendation}; downstream RiskGuard remains the policy authority.`,
    disclaimer: "Mock/demo data only. AI interpretation is advisory and must not be treated as a source of truth.",
  },
  failureMode: 'attestation_pending',
  proofLatencyMs: 1260,
  generatedAt: AI_MOCK_GENERATED_AT,
  tags: ['proof-delay', 'recovery'],
};

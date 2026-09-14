import { isLiveTxHash, isMockEvidence } from "@shared/proofloan";
import type { AiDashboardSnapshot, AiScenario } from "@shared/aiMockTypes";

export function validateAiScenario(scenario: AiScenario): string[] {
  const errors: string[] = [];
  if (!scenario.id) errors.push("missing scenario id");
  if (!scenario.facts.length) errors.push("scenario has no facts");
  if (!scenario.facts.every(fact => isLiveTxHash(fact.txHash))) errors.push("fixture contains malformed full tx hash");
  if (!scenario.facts.every(fact => /^0x[a-fA-F0-9]+$/.test(fact.proofRoot))) errors.push("fixture contains malformed proof root");
  if (!scenario.facts.every(isMockEvidence)) errors.push("fixture facts must be labeled evidenceMode=mock");
  if (scenario.facts.some(fact => fact.source !== "ai-mock")) errors.push("fixture facts must declare source=ai-mock");
  if (scenario.decision.confidence < 0 || scenario.decision.confidence > 1) errors.push("confidence out of range");
  if (scenario.decision.pd90 < scenario.decision.pd30) errors.push("pd90 must be at least pd30");
  if (scenario.features.freshnessScore < 0 || scenario.features.freshnessScore > 1) errors.push("freshness score out of range");
  return errors;
}

export function validateAiDashboard(snapshot: AiDashboardSnapshot): string[] {
  return [
    ...validateAiScenario(snapshot.scenario),
    ...snapshot.whatIf.flatMap(item => item.confidence < 0 || item.confidence > 1 ? [`invalid what-if confidence: ${item.label}`] : []),
  ];
}

import type { GovernanceProposal } from "./types";

function selectorMatches(selector: string, needles: string[]): boolean {
  const normalized = selector.toLowerCase();
  return needles.some(needle => normalized.includes(needle.toLowerCase()));
}

export function validateProofLoanProposal(p: GovernanceProposal): string[] {
  const errors: string[] = [];
  const selectors = p.actions.map(action => action.selector);
  const has = (...needles: string[]) => selectors.some(selector => selectorMatches(selector, needles));

  if (p.kind === "risk-policy" && !has("RiskGuard", "risk-policy", "evidence", "ltv", "apr", "pd30", "freshness")) {
    errors.push("risk proposals must target RiskGuard controls");
  }
  if (p.kind === "ai-model" && !has("model", "ai", "confidence")) {
    errors.push("AI proposals must explicitly reference model controls");
  }
  if (p.kind === "attestor-admission" && !has("attestor")) {
    errors.push("Attestor proposals must target attestor controls");
  }
  if (p.kind === "attestor-policy" && !has("attestor", "quorum", "operator")) {
    errors.push("Attestor policy proposals must target attestor controls");
  }
  if (p.kind === "atc-fee-policy" && !has("fee", "atc", "burn", "reward")) {
    errors.push("ATC proposals must target fee controls");
  }
  return errors;
}

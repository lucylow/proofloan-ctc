import type { AIBlockchainFeatures } from './featureTypes';
export interface ProofAwareScore { score: number; reasons: string[]; abstain: boolean; }
export function scoreVerifiedBehavior(f: AIBlockchainFeatures): ProofAwareScore {
  const reasons: string[] = [];
  const quality = 0.35*f.proofCoverage + 0.2*f.freshnessScore + 0.15*f.evidenceDensity + 0.1*f.crossChainConsistency;
  const behavior = 0.2*f.repaymentSignal + 0.1*f.liquiditySignal + 0.1*(1-f.volatilitySignal);
  const score = Math.max(0, Math.min(1, quality + behavior));
  if (f.proofCoverage < 0.5) reasons.push('LOW_PROOF_COVERAGE');
  if (f.freshnessScore < 0.25) reasons.push('STALE_EVIDENCE');
  if (f.anomalyScore > 0.7) reasons.push('ANOMALOUS_ACTIVITY');
  return { score, reasons, abstain: f.proofCoverage < 0.2 || f.freshnessScore < 0.1 };
}

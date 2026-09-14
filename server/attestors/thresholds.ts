export type AttestorThresholds = {
  warningQuorumBps: number;
  criticalQuorumBps: number;
  warningStakeLossBps: number;
  criticalStakeLossBps: number;
};

export const defaultAttestorThresholds: AttestorThresholds = {
  warningQuorumBps: 7_500,
  criticalQuorumBps: 6_667,
  warningStakeLossBps: 500,
  criticalStakeLossBps: 2_000,
};

export function classifyQuorum(weightBps: number, thresholds = defaultAttestorThresholds): "healthy" | "warning" | "critical" {
  if (weightBps < thresholds.criticalQuorumBps) return "critical";
  if (weightBps < thresholds.warningQuorumBps) return "warning";
  return "healthy";
}

export function classifyStakeLoss(lossBps: number, thresholds = defaultAttestorThresholds): "healthy" | "warning" | "critical" {
  if (lossBps >= thresholds.criticalStakeLossBps) return "critical";
  if (lossBps >= thresholds.warningStakeLossBps) return "warning";
  return "healthy";
}

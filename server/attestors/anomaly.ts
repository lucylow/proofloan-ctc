import type { AttestorProfile } from "@shared/attestors";

export type Anomaly = { operatorId: string; type: "weight-spike" | "uptime-drop" | "fault-spike" | "reward-spike"; score: number; message: string };

export function detectAnomalies(current: AttestorProfile[], previous: AttestorProfile[]): Anomaly[] {
  const prior = new Map(previous.map(p => [p.operatorId, p]));
  const anomalies: Anomaly[] = [];
  for (const profile of current) {
    const old = prior.get(profile.operatorId);
    if (!old) continue;
    const weightDelta = Math.abs(profile.weightBps - old.weightBps);
    const uptimeDelta = old.uptimeBps - profile.uptimeBps;
    const faultDelta = profile.faultCount - old.faultCount;
    const rewardDelta = BigInt(profile.rewardAtomic) - BigInt(old.rewardAtomic);
    if (weightDelta > 1500) anomalies.push({ operatorId: profile.operatorId, type: "weight-spike", score: Math.min(100, weightDelta / 100), message: "Attestor quorum weight changed sharply." });
    if (uptimeDelta > 500) anomalies.push({ operatorId: profile.operatorId, type: "uptime-drop", score: Math.min(100, uptimeDelta / 20), message: "Attestor uptime dropped materially." });
    if (faultDelta >= 2) anomalies.push({ operatorId: profile.operatorId, type: "fault-spike", score: Math.min(100, faultDelta * 20), message: "Attestor fault count increased quickly." });
    if (rewardDelta > BigInt(old.stakeAtomic) / 2n) anomalies.push({ operatorId: profile.operatorId, type: "reward-spike", score: 80, message: "Attestor rewards increased unusually quickly." });
  }
  return anomalies;
}

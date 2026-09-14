import type { AttestorProfile, AttestorFault } from "@shared/attestors";
import { buildHealth } from "./health";
import { FaultBook } from "./faults";

export type WatchtowerAlert = {
  severity: "info" | "warning" | "critical";
  operatorId?: string;
  type: "stale" | "low-uptime" | "jailed" | "fault-spike" | "quorum-risk";
  message: string;
};

export class AttestorWatchtower {
  constructor(private readonly faults: FaultBook) {}

  scan(profiles: AttestorProfile[], requiredQuorumBps: number): WatchtowerAlert[] {
    const alerts: WatchtowerAlert[] = [];
    const health = profiles.map(p => buildHealth(p));
    const availableWeight = health.filter(h => h.available).reduce((sum, h) => sum + h.weightBps, 0);
    if (availableWeight < requiredQuorumBps) alerts.push({ severity: "critical", type: "quorum-risk", message: `Available Attestor weight ${availableWeight} bps is below ${requiredQuorumBps} bps.` });
    for (const item of health) {
      if (item.status === "inactive") alerts.push({ severity: "warning", operatorId: item.operatorId, type: "stale", message: "Attestor heartbeat is stale." });
      if (item.status === "jailed") alerts.push({ severity: "critical", operatorId: item.operatorId, type: "jailed", message: "Attestor is jailed and cannot participate in quorum." });
      if (item.uptimeBps < 9_500) alerts.push({ severity: "warning", operatorId: item.operatorId, type: "low-uptime", message: "Attestor uptime is below the operational target." });
      if (item.faults24h >= 3) alerts.push({ severity: "warning", operatorId: item.operatorId, type: "fault-spike", message: "Attestor has multiple recent faults." });
    }
    return alerts;
  }

  criticalFaults(): AttestorFault[] {
    return this.faults.list().filter(f => f.severity === "critical");
  }
}

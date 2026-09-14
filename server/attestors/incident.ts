import type { AttestorFault } from "@shared/attestors";

export type Incident = { incidentId: string; severity: "warning" | "critical"; title: string; faultIds: string[]; createdAt: string; resolvedAt?: string };

export class IncidentBook {
  private readonly incidents = new Map<string, Incident>();
  open(faults: AttestorFault[]): Incident | null {
    if (faults.length === 0) return null;
    const severity = faults.some(f => f.severity === "critical") ? "critical" : "warning";
    const incident: Incident = { incidentId: `incident_${Date.now()}`, severity, title: `Attestor network ${severity} incident`, faultIds: faults.map(f => f.faultId), createdAt: new Date().toISOString() };
    this.incidents.set(incident.incidentId, incident);
    return { ...incident, faultIds: [...incident.faultIds] };
  }
  resolve(incidentId: string): Incident { const incident = this.incidents.get(incidentId); if (!incident) throw new Error("Unknown incident."); incident.resolvedAt = new Date().toISOString(); return { ...incident, faultIds: [...incident.faultIds] }; }
  list(): Incident[] { return [...this.incidents.values()].map(i => ({ ...i, faultIds: [...i.faultIds] })); }
}

import type { AttestorProfile } from "@shared/attestors";

export type AvailabilityWindow = { startedAt: string; endedAt?: string; available: boolean };

export class AvailabilityBook {
  private readonly windows = new Map<string, AvailabilityWindow[]>();

  record(operatorId: string, available: boolean, at = new Date()): void {
    const list = this.windows.get(operatorId) ?? [];
    const current = list.at(-1);
    if (current && current.available === available && !current.endedAt) return;
    if (current && !current.endedAt) current.endedAt = at.toISOString();
    list.push({ startedAt: at.toISOString(), available });
    if (list.length > 1000) list.splice(0, list.length - 1000);
    this.windows.set(operatorId, list);
  }

  history(operatorId: string): AvailabilityWindow[] { return (this.windows.get(operatorId) ?? []).map(x => ({ ...x })); }
  healthy(operatorId: string): boolean { return this.history(operatorId).at(-1)?.available === true; }

  recalculateProfiles(profiles: AttestorProfile[]): AttestorProfile[] {
    return profiles.map(profile => ({ ...profile, uptimeBps: this.computeUptime(profile.operatorId) }));
  }

  private computeUptime(operatorId: string): number {
    const windows = this.windows.get(operatorId);
    if (!windows || windows.length === 0) return 10_000;
    let available = 0;
    let total = 0;
    const now = Date.now();
    for (const window of windows.slice(-100)) {
      const start = Date.parse(window.startedAt);
      const end = window.endedAt ? Date.parse(window.endedAt) : now;
      if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) continue;
      total += end - start;
      if (window.available) available += end - start;
    }
    if (total <= 0) return 10_000;
    return Math.max(0, Math.min(10_000, Math.round((available / total) * 10_000)));
  }
}

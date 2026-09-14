import type { AttestorProfile, AttestorStatus } from "@shared/attestors";

export type LifecycleEvent = { operatorId: string; from: AttestorStatus; to: AttestorStatus; reason: string; at: string };

const allowed: Record<AttestorStatus, AttestorStatus[]> = {
  active: ["probation", "jailed", "inactive"],
  probation: ["active", "jailed", "inactive"],
  jailed: ["probation", "inactive"],
  inactive: ["probation", "active"],
};

export class OperatorLifecycle {
  private readonly events: LifecycleEvent[] = [];

  transition(profile: AttestorProfile, to: AttestorStatus, reason: string): AttestorProfile {
    if (!allowed[profile.status].includes(to)) throw new Error(`Invalid Attestor lifecycle transition ${profile.status} -> ${to}.`);
    const event: LifecycleEvent = { operatorId: profile.operatorId, from: profile.status, to, reason: reason.slice(0, 256), at: new Date().toISOString() };
    this.events.push(event);
    return { ...profile, status: to, lastSeenAt: new Date().toISOString() };
  }

  history(operatorId?: string): LifecycleEvent[] {
    return this.events.filter(e => !operatorId || e.operatorId === operatorId).map(e => ({ ...e }));
  }

  canParticipate(profile: AttestorProfile): boolean { return profile.status === "active" || profile.status === "probation"; }
}

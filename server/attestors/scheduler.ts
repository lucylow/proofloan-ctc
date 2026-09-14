import type { AttestorProfile } from "@shared/attestors";
import { assignAttestors, type AttestorAssignment } from "./assignments";

export type SchedulerConfig = { slotsPerChain: number; leaseSeconds: number; rotationSeconds: number };

export class AttestorScheduler {
  private readonly assignments = new Map<string, AttestorAssignment[]>();
  private readonly nextRotation = new Map<string, number>();

  constructor(private readonly config: SchedulerConfig = { slotsPerChain: 5, leaseSeconds: 600, rotationSeconds: 300 }) {}

  schedule(chain: string, profiles: AttestorProfile[], now = new Date()): AttestorAssignment[] {
    const rotationAt = this.nextRotation.get(chain) ?? 0;
    if (rotationAt > now.getTime() && this.assignments.has(chain)) return (this.assignments.get(chain) ?? []).map(a => ({ ...a }));
    const assignments = assignAttestors(profiles, chain, this.config.slotsPerChain, this.config.leaseSeconds, now);
    this.assignments.set(chain, assignments);
    this.nextRotation.set(chain, now.getTime() + this.config.rotationSeconds * 1000);
    return assignments.map(a => ({ ...a }));
  }

  current(chain: string): AttestorAssignment[] { return (this.assignments.get(chain) ?? []).map(a => ({ ...a })); }
  dueChains(now = Date.now()): string[] { return [...this.nextRotation.entries()].filter(([, time]) => time <= now).map(([chain]) => chain); }
}

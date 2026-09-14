import type { AttestorProfile } from "@shared/attestors";
import { attestorError } from "./errors";
import { attestorValidationIssue } from "./validation";

export class AttestorRegistry {
  private readonly profiles = new Map<string, AttestorProfile>();

  constructor(initial: AttestorProfile[] = []) {
    initial.forEach(profile => this.upsert(profile));
  }

  upsert(profile: AttestorProfile): void {
    const issue = attestorValidationIssue(profile);
    if (issue) {
      throw attestorError("VALIDATION", `Invalid Attestor profile ${profile.operatorId}: ${issue}`, {
        operatorId: profile.operatorId,
        issue,
      });
    }
    this.profiles.set(profile.operatorId, structuredClone(profile));
  }

  get(operatorId: string): AttestorProfile | undefined {
    const profile = this.profiles.get(operatorId);
    return profile ? structuredClone(profile) : undefined;
  }

  list(environment?: AttestorProfile["environment"]): AttestorProfile[] {
    return [...this.profiles.values()]
      .filter(profile => !environment || profile.environment === environment)
      .map(profile => structuredClone(profile));
  }

  active(environment: AttestorProfile["environment"], chain?: string): AttestorProfile[] {
    return this.list(environment).filter(profile => {
      if (!(profile.status === "active" || profile.status === "probation")) return false;
      return !chain || profile.chains.includes(chain);
    });
  }

  update(operatorId: string, patch: Partial<AttestorProfile>): AttestorProfile {
    const current = this.profiles.get(operatorId);
    if (!current) throw attestorError("NOT_FOUND", `Unknown Attestor ${operatorId}.`, { operatorId });
    const next = { ...current, ...patch };
    this.upsert(next);
    return structuredClone(next);
  }
}

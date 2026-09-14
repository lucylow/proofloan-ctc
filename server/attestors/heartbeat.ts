import type { AttestorProfile } from "@shared/attestors";
import { AvailabilityBook } from "./availability";

export class HeartbeatService {
  constructor(private readonly availability = new AvailabilityBook()) {}

  receive(profile: AttestorProfile, input: { availability: boolean; latencyMs: number; at?: Date }): AttestorProfile {
    const at = input.at ?? new Date();
    this.availability.record(profile.operatorId, input.availability, at);
    return { ...profile, lastSeenAt: at.toISOString(), uptimeBps: Math.max(0, Math.min(10000, profile.uptimeBps + (input.availability ? 5 : -250))), };
  }

  history(operatorId: string) { return this.availability.history(operatorId); }
}

import { sha256Hex } from "./hash";
import type { AttestorEventType } from "@shared/attestors";

export type AttestorAuditEvent = { eventId: string; type: AttestorEventType; at: string; digest: string; metadata: Record<string, unknown> };

export class AttestorAuditTrail {
  private readonly events: AttestorAuditEvent[] = [];
  append(type: AttestorEventType, metadata: Record<string, unknown>): AttestorAuditEvent {
    const eventId = `ae_${this.events.length + 1}`;
    const at = new Date().toISOString();
    const digest = sha256Hex({ eventId, type, at, metadata });
    const event = { eventId, type, at, digest, metadata: redactMetadata(metadata) };
    this.events.push(event);
    if (this.events.length > 5000) this.events.splice(0, this.events.length - 5000);
    return structuredClone(event);
  }
  list(limit = 100): AttestorAuditEvent[] { return this.events.slice(-Math.max(1, limit)).map(x => structuredClone(x)); }
  latestHash(): string | undefined { return this.events.at(-1)?.digest; }
}

function redactMetadata(metadata: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(metadata).map(([key, value]) => {
    if (/private|secret|password|seed|mnemonic/i.test(key)) return [key, "[REDACTED]"];
    return [key, typeof value === "string" && value.length > 512 ? `${value.slice(0, 511)}…` : value];
  }));
}

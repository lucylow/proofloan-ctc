import { randomUUID } from "node:crypto";
import type { AiAuditEvent, AiStage } from "./aiTypes";
import { AI_MAX_AUDIT_EVENTS } from "./constants";
import { shortHash } from "./fingerprint";

export class AiAuditJournal {
  private readonly events: AiAuditEvent[] = [];
  append(input: { requestId: string; stage: AiStage; type: string; detail: string; payload?: unknown }): AiAuditEvent {
    const event: AiAuditEvent = { id: `aie_${randomUUID().replaceAll("-", "")}`, requestId: input.requestId, stage: input.stage, type: input.type, timestamp: new Date().toISOString(), payloadHash: shortHash(input.payload ?? input.detail, 24), safeDetail: input.detail.slice(0, 512) };
    if (this.events.length >= AI_MAX_AUDIT_EVENTS) this.events.shift(); this.events.push(event); return event;
  }
  list(requestId?: string): AiAuditEvent[] { return requestId ? this.events.filter(e => e.requestId === requestId) : [...this.events]; }
  size(): number { return this.events.length; }
}

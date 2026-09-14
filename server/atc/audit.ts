import { createHash, randomUUID } from "node:crypto";
import { canonicalAtcJson, type AtcAuditEvent } from "@shared/atc";

const GENESIS_HASH = `0x${"0".repeat(64)}`;

export class AtcAuditLog {
  private previousHash = GENESIS_HASH;
  private readonly events: AtcAuditEvent[] = [];

  append(kind: string, detail: string, refs: Partial<Pick<AtcAuditEvent, "quoteId" | "actionId" | "feeId">> = {}): AtcAuditEvent {
    const createdAt = new Date().toISOString();
    const eventId = `atc_ev_${randomUUID().replaceAll("-", "")}`;
    const eventHash = `0x${createHash("sha256")
      .update(
        canonicalAtcJson({
          eventId,
          kind,
          detail,
          previousHash: this.previousHash,
          createdAt,
          ...refs,
        }),
      )
      .digest("hex")}`;
    const event: AtcAuditEvent = {
      eventId,
      kind,
      detail,
      previousHash: this.previousHash,
      eventHash,
      createdAt,
      ...refs,
    };
    this.events.push(event);
    this.previousHash = eventHash;
    return event;
  }

  list(): AtcAuditEvent[] {
    return [...this.events];
  }

  head(): string {
    return this.previousHash;
  }
}

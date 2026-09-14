export interface ProofAuditEvent {
  type: string;
  requestId: string;
  timestamp: number;
  metadata: Record<string, string | number | boolean>;
}

export function auditEvent(
  type: string,
  requestId: string,
  metadata: Record<string, string | number | boolean>,
): ProofAuditEvent {
  return { type, requestId, timestamp: Date.now(), metadata };
}

export class ProofAuditLog {
  private readonly events: ProofAuditEvent[] = [];

  record(event: ProofAuditEvent): void {
    this.events.push(event);
  }

  all(): ProofAuditEvent[] {
    return [...this.events];
  }

  reset(): void {
    this.events.length = 0;
  }
}

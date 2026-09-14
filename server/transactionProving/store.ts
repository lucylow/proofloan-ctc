import { TransactionProvingError } from "./errors";
import type { ProofEnvelope, ProofStatus } from "./types";

export interface ProofRecord {
  requestId: string;
  status: ProofStatus;
  envelope?: ProofEnvelope;
  attempts: number;
  updatedAt: number;
}

export class InMemoryProofStore {
  private readonly records = new Map<string, ProofRecord>();

  get(id: string): ProofRecord | undefined {
    return this.records.get(id);
  }

  upsert(record: ProofRecord): void {
    this.records.set(record.requestId, record);
  }

  transition(id: string, status: ProofStatus, patch: Partial<ProofRecord> = {}): ProofRecord {
    const current = this.records.get(id);
    if (!current) throw new TransactionProvingError("STORE", `Unknown proof request ${id}`);
    const next = { ...current, ...patch, status, updatedAt: Date.now() };
    this.records.set(id, next);
    return next;
  }

  all(): ProofRecord[] {
    return [...this.records.values()];
  }

  snapshot() {
    return {
      records: this.records.size,
      statuses: this.all().reduce<Record<string, number>>((acc, record) => {
        acc[record.status] = (acc[record.status] ?? 0) + 1;
        return acc;
      }, {}),
    };
  }

  reset(): void {
    this.records.clear();
  }
}

import type { ProofBundle, ReadabilityQuery, SourceEvent } from "@shared/readability";
import type { ReadabilityStatus, ReadabilityStore, StatusJournalEntry } from "./types";
import { assertTransition } from "./status-machine";

export class MemoryReadabilityStore implements ReadabilityStore {
  private readonly queries = new Map<string, ReadabilityQuery & { queryId: string }>();
  private readonly statuses = new Map<string, ReadabilityStatus>();
  private readonly events = new Map<string, SourceEvent>();
  private readonly proofs = new Map<string, ProofBundle>();
  private readonly processed = new Set<string>();
  private readonly journal: StatusJournalEntry[] = [];

  async putQuery(query: ReadabilityQuery & { queryId: string }): Promise<void> {
    this.queries.set(query.queryId, query);
  }

  async getQuery(queryId: string): Promise<(ReadabilityQuery & { queryId: string }) | null> {
    return this.queries.get(queryId) ?? null;
  }

  async putStatus(queryId: string, status: ReadabilityStatus): Promise<void> {
    const previous = this.statuses.get(queryId);
    if (previous) assertTransition(previous, status);
    this.statuses.set(queryId, status);
    this.journal.push({ queryId, status, at: new Date().toISOString() });
  }

  async getStatus(queryId: string): Promise<ReadabilityStatus | null> {
    return this.statuses.get(queryId) ?? null;
  }

  async putEvent(queryId: string, event: SourceEvent): Promise<void> {
    this.events.set(queryId, event);
  }

  async putProof(queryId: string, proof: ProofBundle): Promise<void> {
    this.proofs.set(queryId, proof);
  }

  async hasProcessedEvent(key: string): Promise<boolean> {
    return this.processed.has(key);
  }

  async markProcessedEvent(key: string): Promise<void> {
    this.processed.add(key);
  }

  snapshot() {
    return {
      queries: this.queries.size,
      statuses: this.statuses.size,
      events: this.events.size,
      proofs: this.proofs.size,
      processed: this.processed.size,
      journal: this.journal.slice(-25),
    };
  }

  reset(): void {
    this.queries.clear();
    this.statuses.clear();
    this.events.clear();
    this.proofs.clear();
    this.processed.clear();
    this.journal.length = 0;
  }
}

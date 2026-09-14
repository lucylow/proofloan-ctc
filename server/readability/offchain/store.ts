import type { EventCursor, IndexedEvent, WorkerJob, WorkerPhase } from "./types";

export interface DurableWorkerStore {
  getCursor(key: string): Promise<EventCursor | null>;
  putCursor(key: string, cursor: EventCursor): Promise<void>;
  getBlockHash(key: string, blockNumber: number): Promise<string | null>;
  putBlockHash(key: string, blockNumber: number, blockHash: string): Promise<void>;
  getEvent(eventId: string): Promise<IndexedEvent | null>;
  putEvent(event: IndexedEvent): Promise<void>;
  getJob(jobId: string): Promise<WorkerJob | null>;
  putJob(job: WorkerJob): Promise<void>;
  listRunnableJobs(nowMs: number, limit: number): Promise<WorkerJob[]>;
  markEventProcessed(eventId: string): Promise<void>;
  isEventProcessed(eventId: string): Promise<boolean>;
  putDeadLetter(job: WorkerJob, reason: string): Promise<void>;
  listDeadLetters(limit: number): Promise<WorkerJob[]>;
}

export class MemoryDurableWorkerStore implements DurableWorkerStore {
  private cursors = new Map<string, EventCursor>();
  private blocks = new Map<string, string>();
  private events = new Map<string, IndexedEvent>();
  private jobs = new Map<string, WorkerJob>();
  private processed = new Set<string>();
  private dead = new Map<string, WorkerJob>();
  private key(namespace: string, block: number) { return `${namespace}:${block}`; }
  async getCursor(key: string) { return this.cursors.get(key) ?? null; }
  async putCursor(key: string, cursor: EventCursor) { this.cursors.set(key, {...cursor}); }
  async getBlockHash(key: string, blockNumber: number) { return this.blocks.get(this.key(key, blockNumber)) ?? null; }
  async putBlockHash(key: string, blockNumber: number, blockHash: string) { this.blocks.set(this.key(key, blockNumber), blockHash); }
  async getEvent(eventId: string) { return this.events.get(eventId) ?? null; }
  async putEvent(event: IndexedEvent) { this.events.set(event.eventId, {...event}); }
  async getJob(jobId: string) { return this.jobs.get(jobId) ?? null; }
  async putJob(job: WorkerJob) { this.jobs.set(job.jobId, {...job}); }
  async listRunnableJobs(nowMs: number, limit: number) {
    const terminal: WorkerPhase[] = ["confirmed", "dead-letter", "cancelled"];
    return [...this.jobs.values()].filter(j => !terminal.includes(j.phase) && Date.parse(j.nextAttemptAt) <= nowMs).sort((a,b) => Date.parse(a.nextAttemptAt) - Date.parse(b.nextAttemptAt)).slice(0, limit);
  }
  async markEventProcessed(eventId: string) { this.processed.add(eventId); }
  async isEventProcessed(eventId: string) { return this.processed.has(eventId); }
  async putDeadLetter(job: WorkerJob, _reason: string) { this.dead.set(job.jobId, {...job, phase:"dead-letter"}); }
  async listDeadLetters(limit: number) { return [...this.dead.values()].slice(0, limit); }
  async listJobs() { return [...this.jobs.values()]; }
  snapshot() { return { jobs: this.jobs.size, events: this.events.size, deadLetters: this.dead.size, processed: this.processed.size }; }
  reset() {
    this.cursors.clear();
    this.blocks.clear();
    this.events.clear();
    this.jobs.clear();
    this.processed.clear();
    this.dead.clear();
  }
}

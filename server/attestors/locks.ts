export class AttestorLockManager {
  private readonly locks = new Map<string, Promise<void>>();
  async runExclusive<T>(key: string, operation: () => Promise<T>): Promise<T> {
    const previous = this.locks.get(key);
    let release!: () => void;
    const gate = new Promise<void>(resolve => { release = resolve; });
    const queued = previous ? previous.then(() => gate) : gate;
    this.locks.set(key, queued);
    if (previous) await previous;
    try { return await operation(); } finally { release(); if (this.locks.get(key) === queued) this.locks.delete(key); }
  }
}

export type LeaseRecord = { owner: string; expiresAt: number; fencingToken: number };

export class LeaseManager {
  private leases = new Map<string, LeaseRecord>();
  private token = 0;
  constructor(private readonly clock = () => Date.now()) {}
  acquire(key: string, owner: string, durationMs: number): LeaseRecord | null {
    const now = this.clock();
    const current = this.leases.get(key);
    if (current && current.expiresAt > now && current.owner !== owner) return null;
    const record = { owner, expiresAt: now + durationMs, fencingToken: ++this.token };
    this.leases.set(key, record);
    return record;
  }
  renew(key: string, owner: string, durationMs: number): LeaseRecord | null {
    const current = this.leases.get(key);
    if (!current || current.owner !== owner || current.expiresAt <= this.clock()) return null;
    const next = {...current, expiresAt: this.clock() + durationMs};
    this.leases.set(key, next);
    return next;
  }
  release(key: string, owner: string): boolean {
    const current = this.leases.get(key);
    if (!current || current.owner !== owner) return false;
    this.leases.delete(key); return true;
  }
  owns(key: string, owner: string): boolean {
    const current = this.leases.get(key);
    return !!current && current.owner === owner && current.expiresAt > this.clock();
  }
}

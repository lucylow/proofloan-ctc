export class PromiseDedupe<T> {
  private readonly pending = new Map<string, Promise<T>>();

  run(key: string, operation: () => Promise<T>): Promise<T> {
    const existing = this.pending.get(key);
    if (existing) return existing;

    const request = operation().finally(() => {
      this.pending.delete(key);
    });

    this.pending.set(key, request);
    return request;
  }

  clear(key?: string) {
    if (key) this.pending.delete(key);
    else this.pending.clear();
  }
}

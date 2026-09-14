export type QueuedAction<T> = { id: string; run: () => Promise<T> };

export class ActionQueue {
  private queue: QueuedAction<unknown>[] = [];
  private running = false;

  enqueue<T>(action: QueuedAction<T>) {
    this.queue.push(action as QueuedAction<unknown>);
    void this.flush();
  }

  clear() { this.queue = []; }

  private async flush() {
    if (this.running) return;
    this.running = true;
    try {
      while (this.queue.length) {
        const action = this.queue.shift();
        if (!action) continue;
        try { await action.run(); } catch { /* isolate action failure */ }
      }
    } finally {
      this.running = false;
    }
  }
}

export class AsyncSemaphore {
  private active = 0;
  private readonly queue: Array<() => void> = [];

  constructor(private readonly limit: number) {
    if (!Number.isInteger(limit) || limit < 1) {
      throw new Error("AsyncSemaphore limit must be >= 1");
    }
  }

  async run<T>(operation: () => Promise<T>): Promise<T> {
    await this.acquire();

    try {
      return await operation();
    } finally {
      this.release();
    }
  }

  private acquire(): Promise<void> {
    if (this.active < this.limit) {
      this.active += 1;
      return Promise.resolve();
    }

    return new Promise(resolve => {
      this.queue.push(() => {
        this.active += 1;
        resolve();
      });
    });
  }

  private release() {
    this.active = Math.max(0, this.active - 1);
    const next = this.queue.shift();
    next?.();
  }
}

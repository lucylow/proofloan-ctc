export class AsyncLock {
  private active = false;

  get isLocked() {
    return this.active;
  }

  async run<T>(operation: () => Promise<T>): Promise<T | undefined> {
    if (this.active) return undefined;

    this.active = true;
    try {
      return await operation();
    } finally {
      this.active = false;
    }
  }
}

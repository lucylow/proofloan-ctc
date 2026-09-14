export class SafeInterval {
  private timer: ReturnType<typeof setInterval> | undefined;
  private active = false;

  start(callback: () => void | Promise<void>, intervalMs: number) {
    this.stop();
    this.active = true;
    this.timer = setInterval(() => {
      if (!this.active) return;
      void Promise.resolve(callback()).catch(() => {
        // polling errors are intentionally isolated
      });
    }, intervalMs);
  }

  stop() {
    this.active = false;
    if (this.timer) clearInterval(this.timer);
    this.timer = undefined;
  }

  get isRunning() {
    return this.active;
  }
}

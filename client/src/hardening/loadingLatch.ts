export class LoadingLatch {
  private counter = 0;

  begin() {
    this.counter += 1;
    return () => this.end();
  }

  end() {
    this.counter = Math.max(0, this.counter - 1);
  }

  get pending() {
    return this.counter > 0;
  }
}

export class RaceSafe<T> {
  private version = 0;
  constructor(private readonly initial: T) {}
  next() { this.version += 1; return this.version; }
  isLatest(version: number) { return version === this.version; }
  reset() { this.version = 0; }
  getInitial() { return this.initial; }
}

import type { CostLedgerEntry, ReadabilityCostBudget } from "./models";

export class ReadabilityCostBudgetManager {
  private readonly entries = new Map<string, CostLedgerEntry>();

  constructor(private readonly budget: ReadabilityCostBudget) {}

  reserve(queryId: string, estimatedCtc: number): boolean {
    if (this.entries.has(queryId) && this.entries.get(queryId)?.status === "reserved") return true;
    if (estimatedCtc > this.budget.perQueryCtc) return false;
    const now = Date.now();
    const hourAgo = now - 3_600_000;
    const minuteAgo = now - 60_000;
    const reserved = [...this.entries.values()].filter(entry => entry.status === "reserved");
    const outstanding = reserved.filter(entry => Date.parse(entry.timestamp) >= hourAgo);
    const lastMinute = reserved.filter(entry => Date.parse(entry.timestamp) >= minuteAgo);
    const hourlyTotal = outstanding.reduce((sum, entry) => sum + entry.estimatedCtc, 0);
    const minuteTotal = lastMinute.reduce((sum, entry) => sum + entry.estimatedCtc, 0);
    if (outstanding.length >= this.budget.maxOutstandingQueries) return false;
    if (hourlyTotal + estimatedCtc > this.budget.perHourCtc) return false;
    if (minuteTotal + estimatedCtc > this.budget.perMinuteCtc) return false;
    this.entries.set(queryId, {
      queryId,
      estimatedCtc,
      timestamp: new Date(now).toISOString(),
      status: "reserved",
    });
    return true;
  }

  settle(queryId: string, actualCtc: number): void {
    const entry = this.entries.get(queryId);
    if (entry) {
      entry.actualCtc = actualCtc;
      entry.status = "settled";
    }
  }

  release(queryId: string): void {
    const entry = this.entries.get(queryId);
    if (entry) entry.status = "released";
  }

  summary() {
    const entries = [...this.entries.values()];
    return {
      reserved: entries.filter(entry => entry.status === "reserved").length,
      reservedCtc: entries
        .filter(entry => entry.status === "reserved")
        .reduce((sum, entry) => sum + entry.estimatedCtc, 0),
      settledCtc: entries
        .filter(entry => entry.status === "settled")
        .reduce((sum, entry) => sum + (entry.actualCtc ?? entry.estimatedCtc), 0),
      budget: this.budget,
    };
  }

  reset(): void {
    this.entries.clear();
  }
}

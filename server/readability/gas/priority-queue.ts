import type { OptimizationDecision } from "./models";

type Item<T> = { value: T; score: number; insertedAt: number };

export class GasAwarePriorityQueue<T> {
  private items: Item<T>[] = [];

  push(value: T, decision: OptimizationDecision): void {
    this.items.push({ value, score: decision.priority, insertedAt: Date.now() });
    this.items.sort((a, b) => b.score - a.score || a.insertedAt - b.insertedAt);
  }

  pop(): T | undefined {
    return this.items.shift()?.value;
  }

  peek(): T | undefined {
    return this.items[0]?.value;
  }

  size(): number {
    return this.items.length;
  }

  snapshot(): Array<{ score: number; insertedAt: number }> {
    return this.items.map(({ score, insertedAt }) => ({ score, insertedAt }));
  }
}

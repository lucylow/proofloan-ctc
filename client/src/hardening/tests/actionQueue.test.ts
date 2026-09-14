import { describe, expect, it } from "vitest";
import { ActionQueue } from "../actionQueue";

describe("action queue", () => {
  it("executes independent actions", async () => {
    const queue = new ActionQueue();
    const results: number[] = [];
    queue.enqueue({ id: "1", run: async () => { results.push(1); } });
    queue.enqueue({ id: "2", run: async () => { results.push(2); } });
    await new Promise(resolve => setTimeout(resolve, 10));
    expect(results).toEqual([1, 2]);
  });
});

import { describe, expect, it } from "vitest";
import { promiseTimeout } from "../promiseTimeout";

describe("promise timeout", () => {
  it("rejects slow operations", async () => {
    await expect(promiseTimeout(new Promise(resolve => setTimeout(() => resolve("late"), 20)), 1)).rejects.toThrow("Operation timed out");
  });
});

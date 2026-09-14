import { describe, expect, it, vi } from "vitest";
import { withRetry, computeBackoff } from "../network";

describe("network hardening", () => {
  it("computes bounded backoff", () => {
    const delay = computeBackoff(10, { maxAttempts: 3, baseDelayMs: 10, maxDelayMs: 100, jitterRatio: 0 });
    expect(delay).toBe(100);
  });

  it("retries retryable operations", async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error("timeout"))
      .mockResolvedValueOnce("ok");

    const result = await withRetry(fn, {
      maxAttempts: 2,
      baseDelayMs: 1,
      maxDelayMs: 1,
      jitterRatio: 0,
    });

    expect(fn).toHaveBeenCalledTimes(2);
    expect(result.ok).toBe(true);
  });
});

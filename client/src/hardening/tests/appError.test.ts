import { describe, expect, it } from "vitest";
import { normalizeAppError } from "../appError";

describe("normalizeAppError", () => {
  it("maps network errors to retryable errors", () => {
    const error = normalizeAppError(new Error("Failed to fetch"));
    expect(error.code).toBe("NETWORK_FAILED");
    expect(error.retryable).toBe(true);
  });

  it("returns safe user-facing text", () => {
    const error = normalizeAppError(new Error("User secret should never become UI copy"));
    expect(error.userMessage).not.toContain("User secret");
  });
});

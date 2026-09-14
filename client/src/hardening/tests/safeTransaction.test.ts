import { describe, expect, it } from "vitest";
import { validateTransactionHash } from "../safeTransaction";

describe("transaction guard", () => {
  it("accepts a 32-byte hash", () => {
    expect(validateTransactionHash(`0x${"a".repeat(64)}`).ok).toBe(true);
  });
  it("rejects malformed hashes", () => {
    expect(validateTransactionHash("0x1234").ok).toBe(false);
  });
});

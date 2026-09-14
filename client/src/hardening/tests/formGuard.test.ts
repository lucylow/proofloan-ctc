import { describe, expect, it } from "vitest";
import { validateAddress, validateAmount, validateTransactionHash } from "../formGuard";

describe("form guards", () => {
  it("accepts a realistic amount", () => {
    expect(validateAmount(4000).success).toBe(true);
  });

  it("rejects NaN", () => {
    expect(validateAmount(Number.NaN).success).toBe(false);
  });

  it("requires a 32-byte transaction hash", () => {
    expect(validateTransactionHash("0x1234").success).toBe(false);
  });

  it("requires a non-empty identity string", () => {
    expect(validateAddress("").success).toBe(false);
  });
});

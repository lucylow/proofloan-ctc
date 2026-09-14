import { describe, expect, it } from "vitest";
import { createIdempotencyKey, isValidIdempotencyKey } from "../idempotency";

describe("idempotency", () => {
  it("creates safe keys", () => {
    const key = createIdempotencyKey("accept");
    expect(isValidIdempotencyKey(key)).toBe(true);
  });
});

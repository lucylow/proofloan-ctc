import { describe, expect, it } from "vitest";
import { parseJsonSafe } from "../safeJson";

describe("safe json", () => {
  it("returns fallback on malformed json", () => {
    const result = parseJsonSafe("{", { ok: false });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toEqual({ ok: false });
  });
});

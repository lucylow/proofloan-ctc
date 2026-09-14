import { describe, expect, it } from "vitest";
import { parseDateSafe, formatDateSafe } from "../safeDate";

describe("safe dates", () => {
  it("rejects invalid dates", () => expect(parseDateSafe("not a date")).toBeUndefined());
  it("formats valid dates", () => expect(formatDateSafe("2026-01-01")).not.toBe("Unknown date"));
});

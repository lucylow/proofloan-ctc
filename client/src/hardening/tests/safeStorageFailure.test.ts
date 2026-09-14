import { describe, expect, it } from "vitest";
import { readJson, writeJson } from "../safeStorage";

describe("storage failures", () => {
  it("does not throw when storage is missing", () => {
    expect(writeJson(undefined, "x", 1).ok).toBe(false);
    expect(readJson(undefined, "x", 2).ok).toBe(false);
  });
});

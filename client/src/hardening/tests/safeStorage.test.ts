import { describe, expect, it } from "vitest";
import { readJson, writeJson } from "../safeStorage";

function memoryStorage() {
  const map = new Map<string, string>();
  return {
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => map.set(key, value),
    removeItem: (key: string) => map.delete(key),
    clear: () => map.clear(),
  };
}

describe("safe storage", () => {
  it("round trips JSON", () => {
    const storage = memoryStorage();
    expect(writeJson(storage, "x", { hello: "world" }).ok).toBe(true);
    const result = readJson(storage, "x", {});
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toEqual({ hello: "world" });
  });
});

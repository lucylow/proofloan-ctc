import { describe, expect, it } from "vitest";
import { isSafeInternalPath, sanitizeInternalPath } from "../safeNavigation";

describe("safe navigation", () => {
  it("rejects javascript URLs", () => {
    expect(isSafeInternalPath("javascript:alert(1)")).toBe(false);
  });

  it("rejects protocol-relative URLs", () => {
    expect(isSafeInternalPath("//evil.example")).toBe(false);
  });

  it("falls back safely", () => {
    expect(sanitizeInternalPath("https://evil.example")).toBe("/dashboard");
  });
});

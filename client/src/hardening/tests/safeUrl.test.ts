import { describe, expect, it } from "vitest";
import { isSafeExternalUrl, safeExplorerUrl } from "../safeLink";

describe("safe links", () => {
  it("rejects javascript URLs", () => expect(isSafeExternalUrl("javascript:alert(1)")).toBe(false));
  it("accepts https URLs", () => expect(isSafeExternalUrl("https://example.com")).toBe(true));
  it("creates an explorer URL for valid tx hashes", () => expect(safeExplorerUrl("https://example.com", `0x${"a".repeat(64)}`)).toContain("/tx/"));
});

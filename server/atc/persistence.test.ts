import { describe, expect, it } from "vitest";
import { parsePersistedAtcQuote } from "./persistence";

describe("ATC persistence guards", () => {
  it("returns null for corrupt or empty quote JSON", () => {
    expect(parsePersistedAtcQuote(null)).toBeNull();
    expect(parsePersistedAtcQuote("")).toBeNull();
    expect(parsePersistedAtcQuote("{")).toBeNull();
    expect(parsePersistedAtcQuote(JSON.stringify({ quoteId: "too-short" }))).toBeNull();
  });
});

import { describe, expect, it } from "vitest";
import { parseSourceChainName, assertPositiveInteger, assertNonEmptyUrlList } from "./validation";

describe("registry validation helpers", () => {
  it("parses registered source chain names", () => {
    expect(parseSourceChainName("Ethereum Mainnet")).toBe("Ethereum Mainnet");
    expect(() => parseSourceChainName("Solana")).toThrow(/Unsupported Attestcoin source chain/);
  });

  it("rejects empty or non-http RPC lists", () => {
    expect(() => assertNonEmptyUrlList("rpc", [])).toThrow(/at least one RPC URL/);
    expect(() => assertNonEmptyUrlList("rpc", ["not-a-url"])).toThrow(/invalid RPC URL/);
    expect(assertNonEmptyUrlList("rpc", ["https://ok.example"])).toEqual(["https://ok.example"]);
    expect(assertPositiveInteger("chainkey", 3)).toBe(3);
    expect(() => assertPositiveInteger("chainkey", 0)).toThrow(/positive integer/);
  });
});

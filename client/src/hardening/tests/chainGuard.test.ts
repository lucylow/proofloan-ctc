import { describe, expect, it } from "vitest";
import { assertSupportedChain, parseChainId } from "../chainGuard";

describe("chain guard", () => {
  it("parses hex chain ids", () => {
    expect(parseChainId("0xaa36a7")).toBe(11155111);
  });

  it("rejects unsupported networks", () => {
    const result = assertSupportedChain(137);
    expect(result.ok).toBe(false);
  });

  it("accepts Ethereum Mainnet as an official Attestcoin source chain", () => {
    const result = assertSupportedChain(1);
    expect(result.ok).toBe(true);
  });
});

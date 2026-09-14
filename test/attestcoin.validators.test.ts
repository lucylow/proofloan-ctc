import { describe, expect, it } from "vitest";
import { assertLiveTxHash, assertSourceChain, validateProofBlock } from "../server/attestcoin/validators";

describe("Attestcoin validators", () => {
  it("accepts a full EVM transaction hash", () => {
    const hash = "0x" + "a".repeat(64);
    expect(assertLiveTxHash(hash)).toBe(hash);
  });

  it("rejects truncated transaction hashes", () => {
    expect(() => assertLiveTxHash("0xabc")).toThrow();
  });

  it("accepts supported source chains", () => {
    expect(assertSourceChain("Ethereum Sepolia")).toBe("Ethereum Sepolia");
    expect(assertSourceChain("Ethereum Mainnet")).toBe("Ethereum Mainnet");
    expect(assertSourceChain("Polygon Amoy")).toBe("Polygon Amoy");
  });

  it("rejects invalid block ordering", () => {
    expect(validateProofBlock(100, 99)).toBe(false);
  });
});

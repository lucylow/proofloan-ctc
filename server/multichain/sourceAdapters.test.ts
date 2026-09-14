import { describe, expect, it } from "vitest";
import { previewTemplateFor } from "./sourceAdapters";
import { resolveSourceChain } from "./registry";

describe("EVM source adapters", () => {
  it("exposes reusable preview templates without inventing official chainkeys", () => {
    const amoy = resolveSourceChain("Polygon Amoy");
    expect(amoy.experimental).toBe(true);
    expect(amoy.chainKey).toBeNull();
    expect(previewTemplateFor("Polygon Amoy").txPrefix).toBe("0x9b");
    expect(previewTemplateFor("Ethereum Sepolia").verificationBlock).toBeGreaterThan(0);
  });
});

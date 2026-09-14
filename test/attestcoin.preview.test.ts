import { describe, expect, it } from "vitest";
import { buildPreviewBundle } from "../server/attestcoin/preview";

describe("Attestcoin preview adapter", () => {
  it("never labels preview facts as source verified", () => {
    const bundle = buildPreviewBundle(
      "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
      "Ethereum Sepolia",
    );

    expect(bundle.receipt.mode).toBe("preview");
    expect(bundle.facts.every(fact => !fact.sourceVerified)).toBe(true);
  });

  it("keeps Polygon Amoy preview available without inventing a chainkey", () => {
    const bundle = buildPreviewBundle(
      "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
      "Polygon Amoy",
    );

    expect(bundle.receipt.mode).toBe("preview");
    expect(bundle.receipt.chainKey).toBe(0);
    expect(bundle.receipt.warnings.some(warning => warning.includes("experimental"))).toBe(true);
  });
});

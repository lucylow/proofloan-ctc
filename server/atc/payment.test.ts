import { describe, expect, it, vi } from "vitest";
import { loadAtcConfigFromEnv } from "./config";
import { AtcError } from "./errors";
import { ExternalProtocolAtcPaymentAdapter } from "./payment";

describe("ATC payment adapter error handling", () => {
  it("maps network failures to retriable payment errors", async () => {
    const adapter = new ExternalProtocolAtcPaymentAdapter({
      ...loadAtcConfigFromEnv(),
      mode: "external",
      paymentAdapterUrl: "https://example.invalid/atc-payment",
    });
    vi.stubGlobal("fetch", vi.fn(async () => {
      throw new TypeError("fetch failed");
    }));
    await expect(
      adapter.verifyPayment({
        paymentReference: "ext-atc-1",
        amountAtomic: "1",
        sender: "0xproofloan",
      }),
    ).rejects.toMatchObject({ code: "PAYMENT", retriable: true });
    vi.unstubAllGlobals();
  });

  it("rejects malformed verification JSON", async () => {
    const adapter = new ExternalProtocolAtcPaymentAdapter({
      ...loadAtcConfigFromEnv(),
      mode: "external",
      paymentAdapterUrl: "https://example.invalid/atc-payment",
    });
    vi.stubGlobal("fetch", vi.fn(async () => ({
      ok: true,
      json: async () => {
        throw new SyntaxError("Unexpected token");
      },
    })));
    await expect(
      adapter.verifyPayment({
        paymentReference: "ext-atc-1",
        amountAtomic: "1",
        sender: "0xproofloan",
      }),
    ).rejects.toBeInstanceOf(AtcError);
    vi.unstubAllGlobals();
  });
});

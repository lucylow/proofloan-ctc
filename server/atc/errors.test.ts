import { describe, expect, it } from "vitest";
import { AtcError, normalizeAtcError, trpcCodeForAtcError } from "./errors";

describe("ATC error normalization", () => {
  it("preserves typed ATC errors", () => {
    const error = new AtcError("EXPIRED", "ATC quote has expired.");
    expect(normalizeAtcError(error)).toBe(error);
    expect(trpcCodeForAtcError(error)).toBe("BAD_REQUEST");
  });

  it("maps unsupported chain and malformed payloads to validation errors", () => {
    const chain = normalizeAtcError(new Error("Unsupported ATC chain: solana"));
    expect(chain.code).toBe("VALIDATION");
    expect(chain.retriable).toBe(false);
    expect(trpcCodeForAtcError(chain)).toBe("BAD_REQUEST");

    const invalid = normalizeAtcError(new Error("Invalid atomic amount."));
    expect(invalid.code).toBe("VALIDATION");
  });

  it("maps timeouts and network failures to retriable payment errors", () => {
    const aborted = new Error("The operation was aborted.");
    aborted.name = "AbortError";
    const timeout = normalizeAtcError(aborted);
    expect(timeout.code).toBe("PAYMENT");
    expect(timeout.retriable).toBe(true);
    expect(trpcCodeForAtcError(timeout)).toBe("TIMEOUT");

    const network = normalizeAtcError(new Error("fetch failed"));
    expect(network.code).toBe("PAYMENT");
    expect(network.retriable).toBe(true);
  });

  it("maps unknown failures to an internal server error", () => {
    const unknown = normalizeAtcError("not-an-error");
    expect(unknown.code).toBe("UNKNOWN");
    expect(trpcCodeForAtcError(unknown)).toBe("INTERNAL_SERVER_ERROR");
  });

  it("maps idempotency collisions to conflict", () => {
    const error = new AtcError("IDEMPOTENCY", "Reservation already exists.");
    expect(trpcCodeForAtcError(error)).toBe("CONFLICT");
  });
});

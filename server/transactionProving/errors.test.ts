import { describe, expect, it } from "vitest";
import { PROOFLOAN_ERROR_CODES, getProofLoanErrorCode } from "@shared/proofloan";
import { InMemoryProofStore } from "./store";
import { TransactionProvingError, normalizeTransactionProvingError, trpcCodeForTransactionProvingError } from "./errors";
import { recover, retryableProofError } from "./recovery";

describe("transaction proving error handling", () => {
  it("preserves typed proving errors", () => {
    const error = new TransactionProvingError("QUERY", "INVALID_TX_HASH");
    expect(normalizeTransactionProvingError(error)).toBe(error);
    expect(error.message).toMatch(/^\[PROVING:QUERY\]/);
    expect(trpcCodeForTransactionProvingError(error)).toBe("BAD_REQUEST");
  });

  it("maps replay and unknown failures to the right tRPC codes", () => {
    const replay = normalizeTransactionProvingError(new Error("Transaction proof request has already been consumed."));
    expect(replay.code).toBe("REPLAY");
    expect(trpcCodeForTransactionProvingError(replay)).toBe("CONFLICT");

    const timeout = Object.assign(new Error("timed out"), { name: "AbortError" });
    const provider = normalizeTransactionProvingError(timeout);
    expect(provider.code).toBe("PROVIDER");
    expect(provider.retriable).toBe(true);
    expect(trpcCodeForTransactionProvingError(provider)).toBe("TIMEOUT");

    const unknown = normalizeTransactionProvingError({ boom: true });
    expect(unknown.code).toBe("UNKNOWN");
    expect(unknown.message).toMatch(/Unknown transaction proving error/);
    expect(trpcCodeForTransactionProvingError(unknown)).toBe("INTERNAL_SERVER_ERROR");
  });

  it("classifies recovery from typed codes instead of string matching alone", () => {
    expect(recover(new TransactionProvingError("FRESHNESS", "PROOF_STALE")).reason).toBe("refresh-attestation");
    expect(recover(new TransactionProvingError("PROVIDER", "unhealthy", true)).retry).toBe(true);
    expect(recover(new TransactionProvingError("REPLAY", "already consumed")).reason).toBe("terminal");
    expect(recover("stale proof").reason).toBe("refresh-attestation");
    expect(retryableProofError(new Error("network timeout"))).toBe(true);
  });

  it("rejects unknown store transitions as typed STORE errors", () => {
    const store = new InMemoryProofStore();
    expect(() => store.transition("missing", "failed")).toThrow(TransactionProvingError);
    try {
      store.transition("missing", "failed");
    } catch (error) {
      expect(error).toMatchObject({ code: "STORE", retriable: false });
    }
  });

  it("classifies structured ProofLoan proving errors", () => {
    expect(
      getProofLoanErrorCode(`[${PROOFLOAN_ERROR_CODES.PROVING}] [PROVING:QUERY] INVALID_TX_HASH`),
    ).toBe("PROOFLOAN_PROVING_ERROR");
  });
});

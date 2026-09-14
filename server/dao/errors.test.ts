import { describe, expect, it } from "vitest";
import {
  DaoError,
  normalizeDaoError,
  parseGovernanceAmount,
  parseGovernanceTimestamp,
  parseSnapshotPower,
  trpcCodeForDaoError,
} from "./errors";

describe("DAO error handling", () => {
  it("preserves typed DAO errors", () => {
    const error = new DaoError("NOT_FOUND", "proposal not found");
    expect(normalizeDaoError(error)).toBe(error);
    expect(trpcCodeForDaoError(error)).toBe("NOT_FOUND");
  });

  it("classifies common engine failures", () => {
    expect(normalizeDaoError(new Error("proposal not found")).code).toBe("NOT_FOUND");
    expect(normalizeDaoError(new Error("guardian required to cancel queued or executing proposals")).code).toBe("GUARDIAN");
    expect(normalizeDaoError(new Error("RiskGuard cannot be disabled")).code).toBe("CONSTITUTION");
    expect(normalizeDaoError(new Error("Delegation cycle detected")).code).toBe("DELEGATION");
    expect(normalizeDaoError(new Error("timelock active")).code).toBe("TIMELOCK");
    expect(normalizeDaoError(new Error("vote already cast")).code).toBe("VOTING");
    expect(normalizeDaoError(new Error("proposal must be queued")).code).toBe("STATE");
    expect(trpcCodeForDaoError(normalizeDaoError(new Error("guardian required")))).toBe("FORBIDDEN");
    expect(trpcCodeForDaoError(normalizeDaoError(new Error("vote already cast")))).toBe("CONFLICT");
  });

  it("wraps unknown values without leaking internals", () => {
    const normalized = normalizeDaoError({ boom: true });
    expect(normalized.code).toBe("UNKNOWN");
    expect(normalized.message).toMatch(/Unknown governance error/);
    expect(trpcCodeForDaoError(normalized)).toBe("INTERNAL_SERVER_ERROR");
  });

  it("rejects invalid timestamps and amounts", () => {
    expect(() => parseGovernanceTimestamp("not-a-date", "voting start")).toThrow(/invalid voting start timestamp/);
    expect(() => parseGovernanceAmount("12.5", "treasury amount")).toThrow(/invalid treasury amount/);
    expect(() => parseSnapshotPower("1e18")).toThrow(/corrupt snapshot voting power/);
    expect(parseGovernanceAmount(12n, "treasury amount")).toBe(12n);
    expect(parseSnapshotPower("500")).toBe(500n);
  });

  it("classifies syntax and timeout failures", () => {
    expect(normalizeDaoError(new SyntaxError("Unexpected token")).code).toBe("VALIDATION");
    const timeout = normalizeDaoError(Object.assign(new Error("timed out"), { name: "AbortError" }));
    expect(timeout.code).toBe("EXECUTION");
    expect(timeout.retriable).toBe(true);
    expect(trpcCodeForDaoError(timeout)).toBe("TIMEOUT");
  });
});

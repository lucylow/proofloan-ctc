import { describe, expect, it } from "vitest";
import { DemoError, isDemoError, normalizeDemoError, trpcCodeForDemoError } from "./errors";
import { loadDemoConfig } from "./config";
import { demoHash } from "./hash";
import { getDemoProfile } from "./profiles";
import { generateDemoScenario } from "./generator";
import { getExtendedCase } from "./extended/catalog";
import { assertLiveClaimsAllowed, redactMockSecrets } from "./guards";
import { canUseDemoFallback } from "./fallback";

describe("demo error handling", () => {
  it("preserves typed demo errors and maps disabled requests to FORBIDDEN", () => {
    const error = new DemoError("DISABLED", "ProofLoan demo mode is disabled.");
    expect(normalizeDemoError(error)).toBe(error);
    expect(isDemoError(error)).toBe(true);
    expect(trpcCodeForDemoError(error)).toBe("FORBIDDEN");
  });

  it("maps unknown catalog and profile lookups to NOT_FOUND", () => {
    expect(() => getDemoProfile("missing-profile")).toThrow(DemoError);
    try {
      getDemoProfile("missing-profile");
    } catch (error) {
      expect(error).toBeInstanceOf(DemoError);
      expect(trpcCodeForDemoError(error as DemoError)).toBe("NOT_FOUND");
    }

    expect(() => getExtendedCase("missing-case")).toThrow(/Unknown extended demo case: missing-case/);
    try {
      getExtendedCase("missing-case");
    } catch (error) {
      expect(error).toBeInstanceOf(DemoError);
      expect(trpcCodeForDemoError(error as DemoError)).toBe("NOT_FOUND");
    }
  });

  it("fails closed on corrupt env numbers instead of throwing", () => {
    const previous = process.env.PROOFLOAN_DEMO_LATENCY_MS;
    try {
      process.env.PROOFLOAN_DEMO_LATENCY_MS = "999999";
      expect(loadDemoConfig().artificialLatencyMs).toBe(5_000);
      process.env.PROOFLOAN_DEMO_LATENCY_MS = "not-a-number";
      expect(loadDemoConfig().artificialLatencyMs).toBe(0);
    } finally {
      if (previous === undefined) delete process.env.PROOFLOAN_DEMO_LATENCY_MS;
      else process.env.PROOFLOAN_DEMO_LATENCY_MS = previous;
    }
  });

  it("hashes circular objects without throwing", () => {
    const cyclic: { self?: unknown } = {};
    cyclic.self = cyclic;
    expect(demoHash(cyclic).length).toBe(64);
    expect(demoHash(Number.NaN).length).toBeGreaterThan(0);
  });

  it("rejects live claims and non-finite generation timestamps", () => {
    expect(() => assertLiveClaimsAllowed("demo", "verified Attestcoin fact")).toThrow(DemoError);
    expect(redactMockSecrets("secret=abc123")).toContain("[redacted]");
    expect(redactMockSecrets(undefined as unknown as string)).toBe("");
    expect(() => generateDemoScenario("strong-borrower", Number.NaN)).toThrow(DemoError);
  });

  it("does not treat fallback eligibility as throwable", () => {
    expect(canUseDemoFallback(new Error("unrelated failure"))).toBe(false);
    expect(canUseDemoFallback({ not: "an error" })).toBe(false);
  });

  it("normalizes unknown values as UNKNOWN demo errors", () => {
    const normalized = normalizeDemoError("boom");
    expect(normalized.code).toBe("UNKNOWN");
    expect(trpcCodeForDemoError(normalized)).toBe("INTERNAL_SERVER_ERROR");
  });
});

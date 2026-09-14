import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { TrpcContext } from "./_core/context";
import { demoRouter } from "./demo/router";
import { demoService } from "./demo/service";
import { isMockEvidence } from "@shared/proofloan";

function createContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

const ENV_KEYS = ["PROOFLOAN_DEMO_MODE", "PROOFLOAN_DEMO_FALLBACK", "PROOFLOAN_DEMO_LABELS"] as const;
const previousEnv: Record<string, string | undefined> = {};

describe("demo tRPC router", () => {
  beforeEach(() => {
    for (const key of ENV_KEYS) previousEnv[key] = process.env[key];
    process.env.PROOFLOAN_DEMO_MODE = "true";
    process.env.PROOFLOAN_DEMO_FALLBACK = "true";
    process.env.PROOFLOAN_DEMO_LABELS = "true";
    demoService.reset();
  });

  afterEach(() => {
    demoService.reset();
    for (const key of ENV_KEYS) {
      if (previousEnv[key] === undefined) delete process.env[key];
      else process.env[key] = previousEnv[key];
    }
  });

  it("exposes health, config, profiles, and an offline application walkthrough", async () => {
    const caller = demoRouter.createCaller(createContext());
    const health = await caller.health();
    expect(health.enabled).toBe(true);
    expect(health.profileCount).toBe(12);

    const config = await caller.config();
    expect(config.warning).toMatch(/never proves a live/i);

    const profiles = await caller.profiles();
    expect(profiles.map(profile => profile.id)).toContain("strong-borrower");

    const created = await caller.createApplication({ profileId: "strong-borrower" });
    expect(created.mode).toBe("demo");
    expect(created.snapshot.facts.every(isMockEvidence)).toBe(true);
    expect(created.snapshot.decision).toBeTruthy();
    expect(created.snapshot.offer).toBeTruthy();

    const loaded = await caller.getApplication({ applicationId: created.snapshot.applicationId });
    expect(loaded?.applicationId).toBe(created.snapshot.applicationId);

    const reset = await caller.reset();
    expect(reset.success).toBe(true);
    expect(await caller.getApplication({ applicationId: created.snapshot.applicationId })).toBeNull();
  });

  it("exposes the extended mock catalog, search, batch, and evaluation APIs", async () => {
    const caller = demoRouter.createCaller(createContext());
    const health = await caller.health();
    expect(health.extendedCaseCount).toBe(180);

    const cases = await caller.extendedCases();
    expect(cases).toHaveLength(180);
    expect(cases.every(item => item.facts.length > 0)).toBe(true);

    const one = await caller.extendedCase({ id: "extended-119" });
    expect(one.kind).toBe("rpc-failure");
    expect(one.failure?.kind).toBe("rpc");

    const searched = await caller.searchExtendedCases({ query: "operator recovery" });
    expect(searched.length).toBeGreaterThan(0);
    expect(searched.every(item => item.kind === "operator-recovery")).toBe(true);

    const batch = await caller.extendedBatch();
    expect(batch.total).toBe(180);
    expect(batch.countsByKind["ai-abstain"]).toBeGreaterThan(0);

    const evaluated = await caller.evaluateExtendedCase({ id: "extended-081" });
    expect(evaluated.status).toBe("Abstain");

    await expect(caller.extendedCase({ id: "missing-case" })).rejects.toMatchObject({
      message: expect.stringContaining("Unknown extended demo case: missing-case"),
    });
  });

  it("refuses demo application creation when demo mode is disabled", async () => {
    process.env.PROOFLOAN_DEMO_MODE = "false";
    const caller = demoRouter.createCaller(createContext());
    await expect(caller.createApplication({ profileId: "strong-borrower" })).rejects.toMatchObject({
      message: expect.stringContaining("ProofLoan demo mode is disabled."),
    });
  });
});

import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("Attestor operator router", () => {
  it("exposes operator summary, readiness, and safe action plans without submitting extrinsics", async () => {
    const caller = appRouter.createCaller(createContext());
    const summary = await caller.attestorOperator.summary();
    expect(summary.operatorId).toBeTruthy();
    expect(summary.electionMode).toBe("AuthorizedOnly");
    expect(summary.status).toBe("unregistered");
    expect(["ready", "blocked", "degraded", "unknown"]).toContain(summary.readiness);

    const readiness = await caller.attestorOperator.readiness();
    expect(readiness.checks.length).toBeGreaterThan(0);
    expect(readiness.checks.some(check => check.id === "authorization" && check.ok === false)).toBe(true);

    const health = await caller.attestorOperator.health();
    expect(health.onChainStatus).toBe("unregistered");
    expect(health.cc3Healthy).toBe(false);

    const plan = await caller.attestorOperator.plan({ action: "register" });
    expect(plan.submitted).toBe(false);
    expect(plan.plan.allowed).toBe(false);
    expect(plan.extrinsic?.method).toBe("registerAttestor");
    expect(plan.extrinsic?.dangerous).toBe(true);

    const runbook = await caller.attestorOperator.runbook();
    expect(runbook.startup).toContain("Confirm AuthorizedOnly status and authorization");
    expect(runbook.boundary).toMatch(/gluwa\/creditcoin3/);
  });

  it("returns on-chain storage query helpers and onboarding stages", async () => {
    const caller = appRouter.createCaller(createContext());
    const queries = await caller.attestorOperator.queries();
    expect(queries.authorized.pallet).toBe("attestation");
    expect(queries.events).toContain("attestation.RegisteredAttestor");

    const onboarding = await caller.attestorOperator.onboarding({ stage: "authorization" });
    expect(onboarding.checks[0]?.message).toMatch(/authorization/i);

    const diagnostics = await caller.attestorOperator.diagnostics();
    expect(diagnostics.preview).not.toHaveProperty("secret");
    expect(diagnostics.secretFormat.ok).toBe(false);
  });
});

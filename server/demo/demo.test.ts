import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { AttestcoinError } from "../attestcoin/errors";
import { isMockEvidence } from "@shared/proofloan";
import { assertLiveClaimsAllowed, demoLabel, redactMockSecrets } from "./guards";
import { canUseDemoFallback, fallbackToDemo } from "./fallback";
import { buildDemoFacts, generateDemoScenario } from "./generator";
import { loadDemoConfig } from "./config";
import { demoHealth } from "./health";
import { demoService } from "./service";
import { DEMO_PROFILE_IDS, type DemoProfileId } from "./types";
import { assertAllDemoCases, DEMO_CASES } from "./generated/index";
import { listDemoProfiles } from "./profiles";

const ENV_KEYS = [
  "PROOFLOAN_DEMO_MODE",
  "PROOFLOAN_DEMO_FALLBACK",
  "PROOFLOAN_DEMO_LABELS",
  "PROOFLOAN_DEMO_DETERMINISTIC",
  "PROOFLOAN_DEMO_PROFILE",
] as const;

const previousEnv: Record<string, string | undefined> = {};

function setDemoEnv(values: Partial<Record<(typeof ENV_KEYS)[number], string | undefined>>) {
  for (const key of ENV_KEYS) {
    const value = values[key];
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
}

describe("ProofLoan demo mock-data layer", () => {
  beforeEach(() => {
    for (const key of ENV_KEYS) previousEnv[key] = process.env[key];
    setDemoEnv({
      PROOFLOAN_DEMO_MODE: "true",
      PROOFLOAN_DEMO_FALLBACK: "true",
      PROOFLOAN_DEMO_LABELS: "true",
      PROOFLOAN_DEMO_DETERMINISTIC: "true",
      PROOFLOAN_DEMO_PROFILE: "strong-borrower",
    });
    demoService.reset();
  });

  afterEach(() => {
    demoService.reset();
    for (const key of ENV_KEYS) {
      if (previousEnv[key] === undefined) delete process.env[key];
      else process.env[key] = previousEnv[key];
    }
  });

  it("exposes twelve named demo profiles", () => {
    expect(listDemoProfiles()).toHaveLength(12);
    expect(DEMO_PROFILE_IDS).toHaveLength(12);
  });

  it("marks generated facts as mock and never as live proofs", () => {
    const facts = buildDemoFacts("strong-borrower", Date.UTC(2026, 8, 13));
    expect(facts.length).toBeGreaterThan(0);
    expect(facts.every(isMockEvidence)).toBe(true);
    expect(facts.every(fact => fact.source === "ProofLoan deterministic demo generator")).toBe(true);
    expect(facts.every(fact => fact.demoProfile === "strong-borrower")).toBe(true);
    expect(facts.every(fact => fact.txHash.startsWith("0x"))).toBe(true);
    expect(facts.every(fact => fact.proofRoot.startsWith("0x"))).toBe(true);
  });

  it("is deterministic for the same profile and timestamp", () => {
    const nowMs = Date.UTC(2026, 8, 13, 12);
    const first = generateDemoScenario("balanced-borrower", nowMs);
    const second = generateDemoScenario("balanced-borrower", nowMs);
    expect(first.walletAddress).toBe(second.walletAddress);
    expect(first.sourceTransactionHash).toBe(second.sourceTransactionHash);
    expect(first.facts.map(fact => fact.id)).toEqual(second.facts.map(fact => fact.id));
    expect(first.features).toEqual(second.features);
  });

  it("refuses live claims on demo data and keeps DEMO DATA labels", () => {
    expect(demoLabel("demo")).toContain("DEMO DATA");
    expect(() => assertLiveClaimsAllowed("demo", "verified Attestcoin fact")).toThrow(/live Attestcoin claim/);
    expect(redactMockSecrets("secret=abc123 mnemonic=one-two")).toContain("[redacted]");
  });

  it("does not fall back unless demo mode and fallback are both enabled", () => {
    const timeout = new AttestcoinError("TIMEOUT", "Proof Builder timed out.");
    expect(canUseDemoFallback(timeout)).toBe(true);

    setDemoEnv({ PROOFLOAN_DEMO_MODE: "false", PROOFLOAN_DEMO_FALLBACK: "true" });
    expect(canUseDemoFallback(timeout, undefined, loadDemoConfig())).toBe(false);

    setDemoEnv({ PROOFLOAN_DEMO_MODE: "true", PROOFLOAN_DEMO_FALLBACK: "false" });
    expect(canUseDemoFallback(timeout, undefined, loadDemoConfig())).toBe(false);
  });

  it("does not treat unrelated live proof failures as fallback candidates", () => {
    expect(canUseDemoFallback(new Error("Source transaction is not mined yet."))).toBe(false);
  });

  it("produces clearly marked fallback facts", () => {
    const result = fallbackToDemo({
      requestedMode: "live",
      sourceChain: "Ethereum Sepolia",
      walletAddress: "0xabc",
    }, "Proof Builder unavailable");
    expect(result.decision.used).toBe(true);
    expect(result.facts.every(isMockEvidence)).toBe(true);
  });

  it("runs demo underwriting offline and still enforces RiskGuard", async () => {
    const strong = await demoService.create("strong-borrower");
    expect(strong.mode).toBe("demo");
    expect(strong.snapshot.evidenceMode).toBe("mock");
    expect(strong.snapshot.facts.every(isMockEvidence)).toBe(true);
    expect(strong.snapshot.decision?.modelVersion).toBe("proofloan-demo-underwriter-v1");
    expect(strong.snapshot.offer).toBeTruthy();

    const stale = await demoService.create("stale-evidence");
    expect(stale.snapshot.offer?.status).toBe("Blocked");
    expect(stale.snapshot.state).toBe("Rejected");
  });

  it("stores ephemeral demo applications and resets them", async () => {
    const created = await demoService.create("sparse-evidence");
    expect(demoService.get(created.snapshot.applicationId)?.applicationId).toBe(created.snapshot.applicationId);
    demoService.reset();
    expect(demoService.get(created.snapshot.applicationId)).toBeNull();
  });

  it("reports demo health without requiring a network", () => {
    const health = demoHealth();
    expect(health.enabled).toBe(true);
    expect(health.profileCount).toBe(12);
    expect(health.extendedCaseCount).toBe(180);
    expect(health.warning).toMatch(/live proof/i);
  });

  it("keeps 120 generated fixtures synthetic and offline", () => {
    expect(DEMO_CASES).toHaveLength(120);
    expect(assertAllDemoCases()).toBe(true);
    for (const fixture of DEMO_CASES) {
      expect(fixture.expectations.shouldRemainClearlySynthetic).toBe(true);
      expect(fixture.expectations.shouldNeverClaimLiveProof).toBe(true);
      const facts = buildDemoFacts(fixture.profileId as DemoProfileId, Date.UTC(2026, 0, fixture.sequence));
      expect(facts.length).toBeGreaterThan(0);
      expect(facts.every(isMockEvidence)).toBe(true);
    }
  });
});

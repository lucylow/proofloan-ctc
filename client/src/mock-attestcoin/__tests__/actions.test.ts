import { describe, expect, it } from "vitest";
import { applyMockDemoAction } from "../demoActions";
import { createMockDataset } from "../createMockDataset";

describe("mock Attestcoin demo actions", () => {
  it("resets a scenario to a fresh deterministic dataset", () => {
    const original = createMockDataset("hero");
    const mutated = {
      ...original,
      notifications: original.notifications.map(item => ({ ...item, read: true })),
    };
    const reset = applyMockDemoAction(mutated, { type: "reset" });
    expect(reset).toEqual(original);
    expect(reset.presentationOnly).toBe(true);
  });

  it("switches scenarios without changing the seed", () => {
    const dataset = createMockDataset("hero");
    const next = applyMockDemoAction(dataset, { type: "switch-scenario", scenario: "judge" });
    expect(next.scenario).toBe("judge");
    expect(next.seed).toBe(dataset.seed);
    expect(next.facts.length).toBeGreaterThan(0);
  });

  it("marks a notification as read", () => {
    const dataset = createMockDataset("proof-delay");
    const target = dataset.notifications.find(item => !item.read);
    expect(target).toBeDefined();
    const next = applyMockDemoAction(dataset, { type: "mark-notification-read", id: target!.id });
    expect(next.notifications.find(item => item.id === target!.id)?.read).toBe(true);
  });

  it("injects the proof-delay scenario", () => {
    const dataset = createMockDataset("hero");
    const next = applyMockDemoAction(dataset, { type: "inject-proof-delay" });
    expect(next.scenario).toBe("proof-delay");
    expect(next.proofRequests.some(proof => proof.status === "delayed")).toBe(true);
  });
});

import { describe, expect, it } from "vitest";
import { ReadabilityCostBudgetManager } from "./budget";
import { GasEstimateCache } from "./cache";
import { compareTiming } from "./compare";
import { DEFAULT_COST_BUDGET, READABILITY_GAS_POLICY } from "./constants";
import { estimateContinuityHashes, planContinuity } from "./continuity";
import { estimateReadabilityGas } from "./estimator";
import { gasPlanFingerprint } from "./fingerprints";
import { planningInputFromSource } from "./from-source";
import { expectedMerkleSiblings } from "./merkle";
import { GasMetricsCollector } from "./metrics";
import { assertProvableTransactionSize, encodedBytesFromHex, transactionSizeRisk } from "./payload-guard";
import { ReadabilityGasPlanner } from "./planner";
import { evaluateGasPolicy } from "./policy";
import { GasAwarePriorityQueue } from "./priority-queue";
import { optimizeQuery } from "./query-plan";
import { shouldPreferRecentFinalization } from "./recent-finalization";
import { classifyGasRisk } from "./risk";
import { chooseLane } from "./router-policy";
import { nextRunAfter } from "./scheduler";
import { generateRegressionVector, REGRESSION_VECTOR_COUNT, regressionVectorInput } from "./vectors";

describe("readability gas optimizer", () => {
  it("matches the documented linear continuity model at 10 hashes", () => {
    const estimate = estimateReadabilityGas({
      continuityHashCount: 10,
      merkleSiblingCount: 1,
      encodedTransactionBytes: 1000,
    });
    expect(estimate.estimatedCtc).toBeGreaterThan(2.3e-5);
    expect(estimate.officialCtc).toBeCloseTo(2.3e-5 + 2.9e-6, 12);
    expect(estimate.continuityCtc).toBeCloseTo(2.9e-6, 12);
  });

  it("blocks transactions over the documented size guard", () => {
    const estimate = estimateReadabilityGas({
      continuityHashCount: 10,
      merkleSiblingCount: 1,
      encodedTransactionBytes: READABILITY_GAS_POLICY.maxTransactionBytes + 1,
    });
    expect(estimate.safe).toBe(false);
    expect(classifyGasRisk(estimate)).toBe("blocked");
  });

  it("can choose wait for expensive historical queries", () => {
    const decision = optimizeQuery({
      continuityHashCount: 1500,
      merkleSiblingCount: 10,
      encodedTransactionBytes: 1024,
      eventBlock: 100,
      attestedBlock: 1600,
    });
    expect(["wait", "manual-review"]).toContain(decision.action);
  });

  it("keeps Merkle and decode additives as unofficial heuristics", () => {
    const estimate = estimateReadabilityGas({
      continuityHashCount: 10,
      merkleSiblingCount: 8,
      encodedTransactionBytes: 200_000,
    });
    expect(estimate.officialCtc).toBeCloseTo(2.3e-5 + 2.9e-6, 12);
    expect(estimate.estimatedCtc).toBeGreaterThan(estimate.officialCtc);
    expect(estimate.merkleComplexityCtc).toBeGreaterThan(0);
    expect(estimate.decodeRiskCtc).toBeGreaterThan(0);
  });
});

describe("continuity and payload guards", () => {
  it("estimates continuity as attested head minus event block", () => {
    expect(estimateContinuityHashes(100, 140)).toBe(40);
    expect(planContinuity(100, 140).recommendation).toBe("already-efficient");
    expect(planContinuity(100, 800).recommendation).toBe("submit-now");
  });

  it("prefers recent finalization once continuity is materially longer", () => {
    expect(shouldPreferRecentFinalization(50)).toBe(false);
    expect(shouldPreferRecentFinalization(150)).toBe(true);
  });

  it("rejects payloads above 500 KB", () => {
    expect(transactionSizeRisk(500_001)).toBe("blocked");
    expect(() => assertProvableTransactionSize(500_001)).toThrow(/500000 byte/);
    expect(encodedBytesFromHex("0xabcd")).toBe(2);
  });

  it("counts Merkle siblings from tree height", () => {
    expect(expectedMerkleSiblings(1)).toBe(1);
    expect(expectedMerkleSiblings(8)).toBe(4);
  });
});

describe("planning, cache, budget, and metrics", () => {
  it("builds planning input from a source payload", () => {
    const input = planningInputFromSource({
      eventBlock: 8_441_000,
      attestedBlock: 8_441_040,
      encodedTransactionHex: "0x001122",
      transactionCount: 8,
    });
    expect(input.continuityHashCount).toBe(40);
    expect(input.encodedTransactionBytes).toBe(3);
    expect(input.merkleSiblingCount).toBe(4);
  });

  it("caches estimates by deterministic fingerprint", () => {
    const cache = new GasEstimateCache<number>(1_000);
    const key = gasPlanFingerprint({ continuityHashCount: 10, merkleSiblingCount: 1, encodedTransactionBytes: 100 });
    expect(key).toBe(
      gasPlanFingerprint({ encodedTransactionBytes: 100, merkleSiblingCount: 1, continuityHashCount: 10 }),
    );
    cache.set(key, 1);
    expect(cache.get(key)).toBe(1);
    expect(cache.get(key, Date.now() + 2_000)).toBeUndefined();
  });

  it("reserves, settles, and releases a cost budget", () => {
    const budget = new ReadabilityCostBudgetManager(DEFAULT_COST_BUDGET);
    expect(budget.reserve("q1", 0.001)).toBe(true);
    expect(budget.reserve("q1", 0.001)).toBe(true);
    budget.settle("q1", 0.0008);
    expect(budget.summary().settledCtc).toBeCloseTo(0.0008);
    budget.release("q2");
    expect(budget.reserve("q3", DEFAULT_COST_BUDGET.perQueryCtc + 1)).toBe(false);
  });

  it("records metrics and prefers cheaper jobs", () => {
    const metrics = new GasMetricsCollector();
    metrics.recordEstimate(0.001);
    metrics.recordSubmitted();
    expect(metrics.snapshot()).toMatchObject({ estimates: 1, submitted: 1 });
    const queue = new GasAwarePriorityQueue<string>();
    const cheap = optimizeQuery({
      continuityHashCount: 10,
      merkleSiblingCount: 1,
      encodedTransactionBytes: 100,
      eventBlock: 1,
      attestedBlock: 11,
    });
    const expensive = optimizeQuery({
      continuityHashCount: 900,
      merkleSiblingCount: 8,
      encodedTransactionBytes: 200_000,
      eventBlock: 1,
      attestedBlock: 901,
    });
    queue.push("expensive", expensive);
    queue.push("cheap", cheap);
    expect(queue.pop()).toBe("cheap");
    expect(chooseLane(cheap)).toBe("fast");
    expect(nextRunAfter(cheap, 1_000)).toBe(1_000);
  });

  it("compares submit-now versus later continuity growth", () => {
    const comparison = compareTiming(10, 1010);
    expect(comparison.officialMultiplier).toBeGreaterThan(1);
    expect(evaluateGasPolicy({ continuityHashes: 10, transactionBytes: 1000 }).allow).toBe(true);
  });

  it("enforces reject and wait decisions", () => {
    const planner = new ReadabilityGasPlanner();
    const blocked = planner.optimize({
      continuityHashCount: 10,
      merkleSiblingCount: 1,
      encodedTransactionBytes: READABILITY_GAS_POLICY.maxTransactionBytes + 1,
      eventBlock: 1,
      attestedBlock: 11,
    });
    expect(() => planner.enforce("blocked", blocked)).toThrow(/rejected by gas policy/);
    const delayed = planner.optimize({
      continuityHashCount: 1500,
      merkleSiblingCount: 10,
      encodedTransactionBytes: 1024,
      eventBlock: 100,
      attestedBlock: 1600,
    });
    expect(() => planner.enforce("delayed", delayed)).toThrow(/deferred/);
  });
});

describe("generated regression vectors", () => {
  it(`produces ${REGRESSION_VECTOR_COUNT} monotonic continuity estimates`, () => {
    const vectors = Array.from({ length: REGRESSION_VECTOR_COUNT }, (_, offset) =>
      generateRegressionVector(offset + 1),
    );
    expect(vectors).toHaveLength(50);
    expect(regressionVectorInput(1)).toEqual({
      continuityHashCount: 25,
      merkleSiblingCount: 1,
      encodedTransactionBytes: 5024,
    });
    expect(regressionVectorInput(50)).toEqual({
      continuityHashCount: 1250,
      merkleSiblingCount: 11,
      encodedTransactionBytes: 201024,
    });
    for (let index = 1; index < vectors.length; index += 1) {
      expect(vectors[index]!.officialCtc).toBeGreaterThan(vectors[index - 1]!.officialCtc);
      expect(vectors[index]!.safe).toBe(true);
    }
    expect(vectors[39]!.continuityHashCount).toBe(1000);
    expect(classifyGasRisk(vectors[39]!)).toBe("high");
  });
});

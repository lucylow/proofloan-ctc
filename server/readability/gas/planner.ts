import { ReadabilityCostBudgetManager } from "./budget";
import { GasEstimateCache } from "./cache";
import { DEFAULT_COST_BUDGET, GAS_POLICY_VERSION, OFFICIAL_CTC_FORMULA, READABILITY_GAS_POLICY } from "./constants";
import { estimateReadabilityGas } from "./estimator";
import { gasPlanFingerprint } from "./fingerprints";
import { GasMetricsCollector } from "./metrics";
import type { GasEstimate, GasEstimateInput, OptimizationDecision } from "./models";
import { evaluateGasPolicy } from "./policy";
import { optimizeQuery, type QueryPlanningInput } from "./query-plan";
import { ReadabilityError } from "../errors";
import { chooseLane } from "./router-policy";
import { nextRunAfter } from "./scheduler";

export class ReadabilityGasPlanner {
  readonly cache = new GasEstimateCache<GasEstimate>();
  readonly metrics = new GasMetricsCollector();
  readonly budget: ReadabilityCostBudgetManager;

  constructor(budget = new ReadabilityCostBudgetManager(DEFAULT_COST_BUDGET)) {
    this.budget = budget;
  }

  estimate(input: GasEstimateInput, now = Date.now()): GasEstimate {
    const key = gasPlanFingerprint({
      continuityHashCount: input.continuityHashCount,
      merkleSiblingCount: input.merkleSiblingCount,
      encodedTransactionBytes: input.encodedTransactionBytes,
    });
    const cached = this.cache.get(key, now);
    if (cached) {
      this.metrics.recordEstimate(cached.estimatedCtc);
      return cached;
    }
    const estimate = estimateReadabilityGas(input);
    this.cache.set(key, estimate, now);
    this.metrics.recordEstimate(estimate.estimatedCtc);
    return estimate;
  }

  optimize(input: QueryPlanningInput): OptimizationDecision {
    this.estimate(input);
    return optimizeQuery(input);
  }

  enforce(queryId: string, decision: OptimizationDecision): OptimizationDecision {
    if (decision.action === "reject") {
      this.metrics.recordRejected();
      throw new ReadabilityError(
        "GAS",
        `Readability query rejected by gas policy (${decision.risk}): ${decision.reasons.join("; ") || "unsafe payload"}.`,
      );
    }
    if (decision.action === "wait") {
      this.metrics.recordDelayed();
      throw new ReadabilityError(
        "GAS",
        `Readability query deferred to keep continuity proofs short (${decision.continuityHashCount} hashes).`,
        true,
      );
    }
    if (decision.action === "manual-review") {
      this.metrics.recordRejected();
      throw new ReadabilityError(
        "GAS",
        `Readability query requires manual review before proof construction (${decision.risk}).`,
      );
    }
    if (!this.budget.reserve(queryId, decision.estimatedCtc)) {
      this.metrics.recordDelayed();
      throw new ReadabilityError("GAS", "Readability cost budget exhausted; retry later.", true);
    }
    this.metrics.recordSubmitted();
    return decision;
  }

  settle(queryId: string, actualCtc: number): void {
    this.budget.settle(queryId, actualCtc);
  }

  release(queryId: string): void {
    this.budget.release(queryId);
  }

  snapshot() {
    const metrics = this.metrics.snapshot();
    return {
      modelVersion: GAS_POLICY_VERSION,
      officialModel: OFFICIAL_CTC_FORMULA,
      maxTransactionBytes: READABILITY_GAS_POLICY.maxTransactionBytes,
      warningContinuityHashes: READABILITY_GAS_POLICY.warningContinuityHashes,
      highContinuityHashes: READABILITY_GAS_POLICY.highContinuityHashes,
      cacheSize: this.cache.size(),
      metrics,
      budget: this.budget.summary(),
    };
  }

  policy(args: { continuityHashes: number; transactionBytes: number }) {
    return {
      ...evaluateGasPolicy(args),
      modelVersion: GAS_POLICY_VERSION,
      officialModel: OFFICIAL_CTC_FORMULA,
    };
  }

  schedule<T>(job: T, decision: OptimizationDecision, now = Date.now()) {
    return {
      job,
      decision,
      lane: chooseLane(decision),
      runAfter: nextRunAfter(decision, now),
    };
  }

  reset(): void {
    this.cache.clear();
    this.metrics.reset();
    this.budget.reset();
  }
}

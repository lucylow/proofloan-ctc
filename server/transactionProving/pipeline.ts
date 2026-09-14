import type { AttestcoinSourceChainName } from "@shared/multichain";
import {
  TRANSACTION_PROVING_FLOW,
  TRANSACTION_PROVING_PIPELINE,
} from "@shared/transactionProving";
import { BLOCK_PROVER_PRECOMPILE } from "@shared/multichain";
import { auditEvent, ProofAuditLog } from "./audit";
import { BackpressureGate } from "./backpressure";
import { ProofCache } from "./cache";
import { estimateProofCost } from "./cost";
import { assertBeforeDeadline } from "./deadline";
import { SafeDecoder } from "./decoder";
import { ProofDedupe } from "./dedupe";
import { TransactionProvingError, normalizeTransactionProvingError } from "./errors";
import { evaluateFreshness } from "./freshness";
import { requireSuccessfulReceipt } from "./guards";
import { healthy, type ProviderHealth } from "./health";
import { DeterministicMockProver } from "./mockProvider";
import { MetricsAccumulator } from "./metrics";
import { TransactionProvingOrchestrator } from "./orchestrator";
import { QueryPlanner } from "./query";
import { recover } from "./recovery";
import { classifyProofRisk } from "./risk";
import { ProofScheduler } from "./scheduler";
import { InMemoryProofStore } from "./store";
import { IdempotentSubmissionManager, PreviewAscClient } from "./submission";
import { PRODUCTION_TRANSACTION_PROVING_BOUNDARIES, liveVerify, previewVerify } from "./adapters";
import type { PipelineResult, ProofEnvelope, TransactionTarget } from "./types";

export class TransactionProvingService {
  readonly planner = new QueryPlanner();
  readonly store = new InMemoryProofStore();
  readonly cache = new ProofCache();
  readonly dedupe = new ProofDedupe();
  readonly metrics = new MetricsAccumulator();
  readonly audit = new ProofAuditLog();
  readonly scheduler = new ProofScheduler();
  readonly backpressure = new BackpressureGate(4);
  readonly submissions = new IdempotentSubmissionManager(new PreviewAscClient());
  readonly decoder = new SafeDecoder();
  readonly providerHealth: ProviderHealth = { healthy: true, latencyMs: 12 };

  private readonly orchestrator = new TransactionProvingOrchestrator(new DeterministicMockProver());

  async provePreview(target: TransactionTarget): Promise<PipelineResult> {
    const request = this.planner.create(target);
    this.backpressure.acquire();
    this.store.upsert({ requestId: request.requestId, status: "queued", attempts: 1, updatedAt: Date.now() });
    this.audit.record(auditEvent("query", request.requestId, { chainKey: target.chainKey, txHash: target.txHash }));

    try {
      if (!healthy(this.providerHealth)) {
        throw new TransactionProvingError("PROVIDER", "Proof builder provider is unhealthy.", true);
      }
      assertBeforeDeadline(request.requestedAt, request.deadlineMs);

      const replayKey = this.dedupe.key(target.chainKey, target.txHash);
      if (this.dedupe.has(replayKey)) {
        throw new TransactionProvingError("REPLAY", "Transaction proof request has already been consumed.");
      }

      const cached = this.cache.get(replayKey);
      const envelope = cached ?? (await this.orchestrator.build(request));
      this.store.transition(request.requestId, "ready", { envelope });
      this.metrics.observe("generated", estimateProofCost(envelope), envelope.continuityProof.hashCount);
      this.audit.record(auditEvent("generation", request.requestId, { fingerprint: envelope.fingerprint }));

      const freshness = evaluateFreshness({
        targetBlock: envelope.transaction.blockNumber,
        attestationBlock: envelope.attestationBlock,
        currentBlock: envelope.attestationBlock,
        window: request.freshnessWindowBlocks,
      });
      if (!freshness.fresh) {
        throw new TransactionProvingError("FRESHNESS", freshness.reason);
      }

      const verification = previewVerify(envelope);
      this.store.transition(request.requestId, "verified");
      this.metrics.observe("verified", estimateProofCost(envelope), envelope.continuityProof.hashCount);

      const extraction = this.decoder.decode(envelope.transaction);
      requireSuccessfulReceipt(extraction);

      const submission = await this.submissions.submit(envelope);
      this.cache.set(replayKey, envelope);
      this.dedupe.mark(replayKey);
      this.audit.record(
        auditEvent("extraction", request.requestId, {
          receiptStatus: extraction.status,
          submitted: submission.txHash,
        }),
      );

      return {
        phase: "extraction",
        request,
        envelope,
        verification,
        extraction,
        decision: classifyProofRisk(envelope),
        adapter: "preview",
        educational: true,
      };
    } catch (error) {
      const normalized = normalizeTransactionProvingError(error);
      const plan = recover(normalized);
      this.metrics.observe("failed");
      try {
        this.store.transition(request.requestId, "failed");
      } catch {
        this.audit.record(auditEvent("failed", request.requestId, { retry: false, requeue: false, reason: "store" }));
      }
      this.audit.record(
        auditEvent("failed", request.requestId, {
          retry: plan.retry,
          requeue: plan.requeue,
          reason: plan.reason,
        }),
      );
      throw normalized;
    } finally {
      this.backpressure.release();
    }
  }

  async proveLive(input: {
    chainKey: number;
    txHash: string;
    sourceChain: AttestcoinSourceChainName;
  }): Promise<{ requestId: string; verification: Awaited<ReturnType<typeof liveVerify>> }> {
    const request = this.planner.create({ chainKey: input.chainKey, txHash: input.txHash });
    const verification = await liveVerify({
      txHash: input.txHash,
      sourceChain: input.sourceChain,
      requestId: request.requestId,
    });
    return { requestId: request.requestId, verification };
  }

  schedule(envelope: ProofEnvelope) {
    return this.scheduler.plan(envelope);
  }

  health() {
    return {
      status: "ok" as const,
      pipeline: [...TRANSACTION_PROVING_PIPELINE],
      flow: [...TRANSACTION_PROVING_FLOW],
      blockProverPrecompile: BLOCK_PROVER_PRECOMPILE,
      synchronousVerification: true,
      provider: this.providerHealth,
      inFlight: this.backpressure.inFlightCount,
      store: this.store.snapshot(),
      metrics: this.metrics.snapshot(),
      adapters: {
        preview: {
          prover: "DeterministicMockProver",
          verifier: "verifyOffchainEnvelope",
          production: false,
          educational: true,
          note: "Local Merkle and continuity helpers are structural checks. They are not Attestcoin consensus.",
        },
        live: {
          prover: "@gluwa/usc-sdk ProofBuilder",
          verifier: `PrecompileBlockProver ${BLOCK_PROVER_PRECOMPILE}`,
          production: true,
          educational: false,
          note: "Live verification stays on the official Proof Builder and Block Prover path.",
        },
      },
      boundaries: PRODUCTION_TRANSACTION_PROVING_BOUNDARIES,
    };
  }

  reset(): void {
    this.store.reset();
    this.dedupe.reset();
    this.metrics.reset();
    this.audit.reset();
    this.submissions.reset();
  }
}

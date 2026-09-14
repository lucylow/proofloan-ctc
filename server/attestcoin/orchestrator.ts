import type {
  AttestcoinProofBundle,
  AttestcoinProofRequest,
} from "@shared/attestcoin";
import { getProofMode } from "@shared/proofloan";
import { AttestcoinProofService } from "./proofService";
import { TtlCache } from "./cache";
import { AsyncSemaphore } from "./semaphore";
import { CircuitBreaker } from "./circuitBreaker";
import { AttestcoinMetricsStore } from "./metrics";
import { ATTESTCOIN_CONFIG } from "./config";
import { requestFingerprint } from "./fingerprint";
import { AttestcoinError } from "./errors";
import { classifyProofRequest } from "../multichain/requestPolicy";
import { snapshotMultichainMetrics } from "../multichain/observability";
import { listNamedCircuitDiagnostics } from "../multichain/circuitBreaker";
import { getPublicEnvironmentSnapshot } from "../multichain/environment";
import { allEnvironmentDiagnostics } from "../multichain/environment-v2/diagnostics";
import { attestorService } from "../attestors";
import { currentAttestorEnvironment } from "../attestors/operational";

export class AttestcoinOrchestrator {
  private readonly proofService = new AttestcoinProofService();
  private readonly cache = new TtlCache<AttestcoinProofBundle>();
  private readonly semaphore = new AsyncSemaphore(
    ATTESTCOIN_CONFIG.maxConcurrentProofs,
  );
  private readonly circuit = new CircuitBreaker(4, 20_000);
  private readonly metrics = new AttestcoinMetricsStore();

  async request(
    input: AttestcoinProofRequest,
  ): Promise<AttestcoinProofBundle> {
    const key = requestFingerprint({
      chain: input.sourceChain,
      txHash: input.txHash,
      environment: getPublicEnvironmentSnapshot().environment,
      idempotencyKey: input.idempotencyKey,
    });

    this.metrics.recordRequest();

    if (!input.forceRefresh) {
      const cached = this.cache.get(key);
      if (cached) {
        this.metrics.recordCacheHit();
        return {
          ...cached,
          receipt: {
            ...cached.receipt,
            cached: true,
            mode: "cached",
          },
        };
      }
    }

    return this.semaphore.run(async () => {
      try {
        const mode = getProofMode(
          input.txHash,
          input.sourceChain,
        );

        if (mode !== "live") {
          throw new AttestcoinError(
            "VALIDATION",
            "Attestcoin orchestrator requires a live transaction hash.",
            { requestId: input.requestId },
          );
        }

        const policy = classifyProofRequest({
          txHash: input.txHash,
          sourceChain: input.sourceChain,
          intent: "live",
          allowPreviewFallback: input.allowPreviewFallback,
        });

        if (policy.kind === "reject") {
          throw new AttestcoinError(
            "UNSUPPORTED_CHAIN",
            policy.reason,
            { requestId: input.requestId },
          );
        }

        const started = Date.now();

        const bundle = await this.circuit.run(() =>
          this.proofService.generate({
            txHash: input.txHash,
            sourceChain: input.sourceChain,
            requestId: input.requestId,
            idempotencyKey: input.idempotencyKey,
            deadlineMs: input.deadlineMs,
            mode: "live",
          }),
        );
        bundle.attestorNetwork = attestorService.snapshot(
          currentAttestorEnvironment(bundle.receipt.environment ?? ATTESTCOIN_CONFIG.environment),
        );

        this.cache.set(
          key,
          bundle,
          ATTESTCOIN_CONFIG.cacheTtlMs,
        );

        this.metrics.recordSuccess(
          Date.now() - started,
        );

        return bundle;
      } catch (error) {
        this.metrics.recordFailure();
        throw error;
      }
    });
  }

  diagnostics() {
    return {
      metrics: this.metrics.snapshot(),
      circuit: this.circuit.diagnostics(),
      cacheEntries: this.cache.size(),
      environment: getPublicEnvironmentSnapshot(),
      officialEnvironments: allEnvironmentDiagnostics(),
      multichain: snapshotMultichainMetrics(),
      namedCircuits: listNamedCircuitDiagnostics(),
    };
  }
}

export const attestcoinOrchestrator =
  new AttestcoinOrchestrator();

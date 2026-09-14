import { BLOCK_PROVER_PRECOMPILE } from "@shared/multichain";
import type { ReadabilityQuery, ReadabilityReceipt, SourceEvent } from "@shared/readability";
import type { AscExecutor, AttestationProvider, ProofBuilder, ReadabilityConfig, ReadabilityStore } from "./types";
import { eventKey, stableQueryId } from "./ids";
import { assertAttestationMatches } from "./attestation";
import { assertFinal } from "./finality";
import { assertEventPolicy } from "./event-policy";
import { ReplayGuard } from "./replay";
import { isReadabilityError, isValidTimestamp, normalizeReadabilityError, ReadabilityError } from "./errors";
import { resolveSourceChain } from "../multichain/registry";
import { planningInputFromSource } from "./gas/from-source";
import { ReadabilityGasPlanner } from "./gas/planner";
import { assertReadabilityProofSafety } from "../transactionProving/bridge";
import { assessPreviewMerkleInclusion, PREVIEW_TREE_WIDTH } from "./merkle";

export class ReadabilityWorker {
  constructor(
    private readonly config: ReadabilityConfig,
    private readonly store: ReadabilityStore,
    private readonly attestation: AttestationProvider,
    private readonly proofBuilder: ProofBuilder,
    private readonly asc: AscExecutor,
    private readonly replay = new ReplayGuard(),
    private readonly gas = new ReadabilityGasPlanner(),
  ) {}

  async process(query: ReadabilityQuery, event: SourceEvent): Promise<ReadabilityReceipt> {
    assertEventPolicy(event, query);
    const queryId = stableQueryId({
      environment: query.environment,
      sourceChain: query.sourceChain,
      sourceContract: query.sourceContract.toLowerCase(),
      eventName: query.eventName,
      transactionHash: event.transactionHash.toLowerCase(),
      logIndex: event.logIndex,
    });
    const resolved = resolveSourceChain(query.sourceChain, { environment: query.environment });
    if (resolved.chainKey === null) {
      throw new ReadabilityError(
        "CHAIN",
        `${query.sourceChain} has no official Attestcoin chainKey in ${query.environment}.`,
      );
    }
    const replayKey = this.replay.key({
      chainKey: resolved.chainKey,
      blockHeight: event.blockNumber,
      transactionIndex: event.transactionIndex,
      logIndex: event.logIndex,
      source: event.transactionHash,
    });
    const processedKey = eventKey(
      event.chainId,
      event.blockNumber,
      event.transactionHash,
      event.logIndex,
    );
    if (this.replay.has(replayKey) || await this.store.hasProcessedEvent(processedKey)) {
      throw new ReadabilityError("REPLAY", "Readability query has already been consumed.");
    }

    try {
      const existing = await this.store.getStatus(queryId);
      if (existing === "delivered") {
        throw new ReadabilityError("REPLAY", "Readability query has already been consumed.");
      }
      await this.store.putQuery({ ...query, queryId });
      await this.store.putEvent(queryId, event);
      if (!existing) {
        await this.store.putStatus(queryId, "created");
        await this.store.putStatus(queryId, "watching");
      } else if (existing === "failed") {
        await this.store.putStatus(queryId, "watching");
      } else if (existing === "watching" || existing === "awaiting-attestation") {
        // Resume an in-flight query, including gas-aware deferrals.
      } else if (existing === "expired" || existing === "rejected") {
        throw new ReadabilityError("REPLAY", `Readability query is terminal (${existing}).`);
      }

      if (query.deadline) {
        if (!isValidTimestamp(query.deadline)) {
          throw new ReadabilityError("VALIDATION", "Readability query deadline is not a valid timestamp.");
        }
        if (Date.now() >= Date.parse(query.deadline)) {
          await this.store.putStatus(queryId, "expired");
          throw new ReadabilityError("EXPIRED", "Readability query expired before attestation.");
        }
      }

      const latestBlock = event.blockNumber + Math.max(event.confirmations, 1) - 1;
      const matured = assertFinal(event, latestBlock, {
        minConfirmations: query.minConfirmations,
        reorgBuffer: this.config.reorgBufferBlocks,
      });
      if (existing !== "awaiting-attestation") {
        await this.store.putStatus(queryId, "awaiting-attestation");
      }

      const attestation = await this.attestation.waitForAttestation({
        chainKey: resolved.chainKey,
        blockNumber: matured.blockNumber,
        blockHash: matured.blockHash,
        timeoutMs: this.config.attestationTimeoutMs,
      });
      assertAttestationMatches(attestation, matured);

      const attestedHead = Math.max(latestBlock, attestation.sourceBlock);
      const gasPlan = this.gas.optimize(
        planningInputFromSource({
          eventBlock: matured.blockNumber,
          attestedBlock: attestedHead,
          encodedTransactionHex: matured.data,
          transactionCount: this.proofBuilder.kind === "preview" ? PREVIEW_TREE_WIDTH : undefined,
          deadlineMs: query.deadline ? Date.parse(query.deadline) : undefined,
        }),
      );
      if (this.config.gasAware) {
        try {
          this.gas.enforce(queryId, gasPlan);
        } catch (error) {
          if (isReadabilityError(error) && error.code === "GAS" && !error.retriable) {
            await this.store.putStatus(queryId, "rejected");
          }
          throw error;
        }
      }

      await this.store.putStatus(queryId, "proof-building");

      const proof = await this.proofBuilder.build(query, matured);
      assertReadabilityProofSafety(proof);
      await this.store.putProof(queryId, proof);
      await this.store.putStatus(queryId, "proof-ready");
      const result = await this.asc.submit(query, matured, proof);
      await this.store.putStatus(queryId, "submitted");
      await this.store.putStatus(queryId, "verified");
      await this.store.putStatus(queryId, "delivered");
      await this.store.markProcessedEvent(processedKey);
      this.replay.claim(replayKey);
      if (this.config.gasAware) {
        this.gas.settle(queryId, gasPlan.estimatedCtc);
      }

      return {
        queryId,
        environment: query.environment,
        adapter: this.proofBuilder.kind,
        transactionHash: result.transactionHash,
        verified: true,
        receiptStatus: 1,
        deliveredAt: new Date().toISOString(),
        sourceEvent: matured,
        chainKey: proof.chainKey,
        sourceBlock: proof.blockHeight,
        proofRoot: proof.proofRoot,
        blockProver: BLOCK_PROVER_PRECOMPILE,
        educational: this.proofBuilder.kind === "preview",
        merkleInclusion: assessPreviewMerkleInclusion(proof),
      };
    } catch (error) {
      if (this.config.gasAware) {
        this.gas.release(queryId);
      }
      if (isReadabilityError(error) && error.code === "GAS" && error.retriable) {
        throw error;
      }
      const status = await this.store.getStatus(queryId);
      if (status && status !== "expired" && status !== "rejected" && status !== "delivered" && status !== "failed") {
        try {
          await this.store.putStatus(queryId, status === "created" ? "rejected" : "failed");
        } catch {
          // Keep the original error if the failure transition is itself invalid.
        }
      }
      throw normalizeReadabilityError(error);
    }
  }
}

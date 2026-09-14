import { BLOCK_PROVER_PRECOMPILE } from "@shared/multichain";
import { READABILITY_PIPELINE, type ReadabilityQuery, type SourceEvent } from "@shared/readability";
import type { ReadabilityConfig } from "./types";
import { MemoryReadabilityStore } from "./memory-store";
import { ReadabilityWorker } from "./worker";
import { PreviewAttestationProvider, PRODUCTION_READABILITY_BOUNDARIES } from "./preview-adapters";
import { DeterministicProofBuilder } from "./proof-builder";
import { PreviewBlockProver, ReadabilityExecutor } from "./asc";
import { eventPolicySnapshot } from "./event-policy";
import { ReplayGuard } from "./replay";
import type { ReadabilityLiveInput } from "@shared/readability";
import { assertExplicitEventName } from "./event-policy";
import { ReadabilityGasPlanner } from "./gas/planner";

export class ReadabilityService {
  readonly store: MemoryReadabilityStore;
  readonly replay: ReplayGuard;
  readonly gas: ReadabilityGasPlanner;
  readonly worker: ReadabilityWorker;

  constructor(
    private readonly config: ReadabilityConfig,
    store = new MemoryReadabilityStore(),
    replay = new ReplayGuard(),
    gas = new ReadabilityGasPlanner(),
  ) {
    this.store = store;
    this.replay = replay;
    this.gas = gas;
    this.worker = new ReadabilityWorker(
      config,
      store,
      new PreviewAttestationProvider(),
      new DeterministicProofBuilder(),
      new ReadabilityExecutor(new PreviewBlockProver()),
      replay,
      gas,
    );
  }

  async deliverPreview(query: ReadabilityQuery, event: SourceEvent) {
    return this.worker.process(query, event);
  }

  async deliverLive(input: ReadabilityLiveInput) {
    assertExplicitEventName(input.eventName);
    const { deliverLiveReadability } = await import("./adapters");
    return deliverLiveReadability(input);
  }

  health() {
    return {
      status: "ok" as const,
      environment: this.config.environment,
      pollIntervalMs: this.config.pollIntervalMs,
      reorgBufferBlocks: this.config.reorgBufferBlocks,
      blockProverPrecompile: BLOCK_PROVER_PRECOMPILE,
      synchronousVerification: true,
      adapters: {
        preview: {
          attestation: "PreviewAttestationProvider",
          proofBuilder: "DeterministicProofBuilder",
          blockProver: "PreviewBlockProver",
          merkle: "local hashLeaf(0x00) / hashInner(0x01) inclusion",
          production: false,
          note: "Educational/test adapter. Local keccak inclusion is not Attestcoin consensus.",
        },
        live: {
          attestation: "LiveAttestationProvider / ProofBuilder.waitUntilHeightAttested",
          proofBuilder: "@gluwa/usc-sdk ProofBuilder",
          blockProver: `PrecompileBlockProver ${BLOCK_PROVER_PRECOMPILE}`,
          production: true,
          note: "Live delivery uses the existing Attestcoin proof path. The preview pipeline is never treated as consensus.",
        },
      },
      boundaries: PRODUCTION_READABILITY_BOUNDARIES,
      pipeline: [...READABILITY_PIPELINE],
      policy: eventPolicySnapshot(),
      store: this.store.snapshot(),
      gas: {
        aware: this.config.gasAware,
        ...this.gas.snapshot(),
      },
    };
  }

  reset(): void {
    this.store.reset();
    this.replay.reset();
    this.gas.reset();
  }
}

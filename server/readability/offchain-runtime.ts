import { FOCUSED_SOURCE_EVENTS, type ReadabilityQuery, type SourceEvent } from "@shared/readability";
import { resolveSourceChain } from "../multichain/registry";
import { DeterministicProofBuilder } from "./proof-builder";
import { PreviewBlockProver, ReadabilityExecutor } from "./asc";
import { assertEventPolicy, assertExplicitEventName } from "./event-policy";
import { ReadabilityError } from "./errors";
import { READABILITY_DEMO_CONTRACT } from "./fixtures";
import {
  MemoryRpcSource,
  PreviewAttestationSource,
  ProtocolAscSource,
  ProtocolProofSource,
  sourceLogFromEvent,
} from "./offchain-adapters";
import { SourceContractRegistry } from "./offchain/source-contract";
import { loadWorkerConfig } from "./offchain/config";
import { validateWorkerConfig } from "./offchain/config-validation";
import { MemoryDurableWorkerStore } from "./offchain/store";
import { ProductionReadabilityWorker } from "./offchain/worker";
import type { Logger, RpcSource, WorkerConfig } from "./offchain/types";
import { stableQueryId } from "./ids";

validateWorkerConfig(loadWorkerConfig());

const quietLogger: Logger = {
  debug() {},
  info() {},
  warn() {},
  error() {},
};

export type OffchainRuntimeOptions = {
  rpcSources?: RpcSource[];
  config?: Partial<WorkerConfig>;
  logger?: Logger;
};

export class OffchainWorkerRuntime {
  private store: MemoryDurableWorkerStore;
  private rpc: MemoryRpcSource;
  private allowlist = new SourceContractRegistry();
  worker: ProductionReadabilityWorker;
  readonly config: WorkerConfig;

  constructor(private readonly options: OffchainRuntimeOptions = {}) {
    this.config = validateWorkerConfig(loadWorkerConfig(options.config));
    this.store = new MemoryDurableWorkerStore();
    this.rpc = new MemoryRpcSource("memory-sepolia", 0, []);
    this.registerDefaults();
    this.worker = this.createWorker();
  }

  start() {
    this.worker.start();
  }

  stop() {
    this.worker.stop();
  }

  reset() {
    this.stop();
    this.store.reset();
    this.rpc = new MemoryRpcSource("memory-sepolia", 0, []);
    this.allowlist = new SourceContractRegistry();
    this.registerDefaults();
    this.worker = this.createWorker();
  }

  health() {
    return {
      ...this.worker.health(),
      store: this.store.snapshot(),
      allowlist: {
        demoContract: READABILITY_DEMO_CONTRACT,
        focusedEvents: [...FOCUSED_SOURCE_EVENTS],
      },
      protocolBoundary: {
        proofBuilder: "DeterministicProofBuilder for durable preview jobs",
        liveProofs: "readability.deliverLive -> verifyLiveAttestcoinProof / PrecompileBlockProver 0x0FD2",
        educational: true,
      },
    };
  }

  async jobs() {
    return this.store.listJobs();
  }

  async deadLetters() {
    return this.store.listDeadLetters(50);
  }

  async discover(input: { queryId?: string; address: string; eventName: string; chainId?: string }) {
    assertExplicitEventName(input.eventName);
    const chainId = input.chainId ?? "ethereum-sepolia";
    this.ensureAllowed(chainId, input.address, input.eventName);
    const queryId = input.queryId ?? `rw_${Date.now().toString(36)}`;
    const scanned = await this.worker.discover(queryId, {
      address: input.address,
      eventName: input.eventName,
    });
    return { queryId, ...scanned };
  }

  async ingestPreview(query: ReadabilityQuery, event: SourceEvent) {
    assertEventPolicy(event, query);
    const resolved = resolveSourceChain(query.sourceChain, { environment: query.environment });
    this.ensureAllowed(event.chainId, event.contractAddress, event.eventName);
    const log = sourceLogFromEvent(event, resolved.chainKey ?? undefined);
    const latest = event.blockNumber + Math.max(event.confirmations, query.minConfirmations, this.config.minConfirmations) + 8;
    this.rpc.seed([log], latest);
    const queryId = stableQueryId({
      environment: query.environment,
      sourceChain: query.sourceChain,
      sourceContract: query.sourceContract.toLowerCase(),
      eventName: query.eventName,
      transactionHash: event.transactionHash.toLowerCase(),
      logIndex: event.logIndex,
    });
    const ingested = await this.worker.ingest(queryId, [log], latest);
    await this.worker.tick();
    const jobs = await this.store.listJobs();
    const job = jobs.find(item => item.queryId === queryId) ?? jobs.at(-1) ?? null;
    return {
      queryId,
      ingested,
      job,
      health: this.health(),
    };
  }

  async tick() {
    await this.worker.tick();
    return this.health();
  }

  private ensureAllowed(chainId: string, address: string, eventName: string) {
    if (!this.allowlist.get(chainId, address)) {
      this.allowlist.register({
        chainId,
        address,
        eventNames: new Set<string>(FOCUSED_SOURCE_EVENTS),
      });
    }
    if (!this.allowlist.allows(chainId, address, eventName)) {
      throw new ReadabilityError(
        "EVENT_POLICY",
        `Source contract ${address} is not allowlisted for ${eventName}.`,
      );
    }
  }

  private registerDefaults() {
    this.allowlist.register({
      chainId: "ethereum-sepolia",
      address: READABILITY_DEMO_CONTRACT,
      eventNames: new Set<string>(FOCUSED_SOURCE_EVENTS),
    });
  }

  private createWorker() {
    const rpcSources = this.options.rpcSources?.length ? this.options.rpcSources : [this.rpc];
    const attestation = new PreviewAttestationSource(rpcSources[0]!);
    const proofs = new ProtocolProofSource(
      new DeterministicProofBuilder(),
      this.config.environment,
      Math.max(this.config.minConfirmations, 32),
    );
    const asc = new ProtocolAscSource(
      new ReadabilityExecutor(new PreviewBlockProver()),
      this.config.environment,
      Math.max(this.config.minConfirmations, 32),
    );
    return new ProductionReadabilityWorker({
      store: this.store,
      rpcSources,
      attestation,
      proofs,
      asc,
      config: this.config,
      logger: this.options.logger ?? quietLogger,
    });
  }
}

export const readabilityOffchainRuntime = new OffchainWorkerRuntime();

export function resetReadabilityOffchainRuntime() {
  readabilityOffchainRuntime.reset();
}

import type { ProofBundle, ReadabilityEnvironment, ReadabilityQuery, SourceEvent } from "@shared/readability";
import {
  isAttestcoinSourceChainName,
  isSourceChainId,
  sourceChainNameFromId,
  type AttestcoinSourceChainName,
} from "@shared/multichain";
import type { AscExecutor, ProofBuilder } from "./types";
import type { AscSource, AttestationSource, ProofSource, RpcSource, SourceLog } from "./offchain/types";
import { ReadabilityError } from "./errors";

export function sourceChainFromLog(event: SourceLog): AttestcoinSourceChainName {
  if (isSourceChainId(event.chainId)) return sourceChainNameFromId(event.chainId);
  if (isAttestcoinSourceChainName(event.chainId)) return event.chainId;
  throw new ReadabilityError("CHAIN", `Unsupported readability source chain: ${event.chainId}`);
}

export function sourceEventFromLog(event: SourceLog, latest = 0): SourceEvent {
  const confirmations =
    "confirmations" in event && Number.isFinite(Number((event as { confirmations?: number }).confirmations))
      ? Number((event as { confirmations: number }).confirmations)
      : Math.max(0, latest - event.blockNumber);
  return {
    chainId: event.chainId,
    blockNumber: event.blockNumber,
    blockHash: event.blockHash,
    transactionHash: event.transactionHash,
    transactionIndex: event.transactionIndex,
    logIndex: event.logIndex,
    contractAddress: event.contractAddress,
    eventName: event.eventName,
    topics: event.topics,
    data: event.data,
    confirmations,
    observedAt: event.observedAt,
  };
}

export function queryFromLog(
  event: SourceLog,
  environment: ReadabilityEnvironment,
  minConfirmations: number,
): ReadabilityQuery {
  return {
    environment,
    sourceChain: sourceChainFromLog(event),
    sourceContract: event.contractAddress,
    eventName: event.eventName,
    transactionHash: event.transactionHash,
    minConfirmations,
  };
}

export function sourceLogFromEvent(event: SourceEvent, chainKey?: number): SourceLog {
  return {
    chainId: event.chainId,
    chainKey,
    blockNumber: event.blockNumber,
    blockHash: event.blockHash,
    transactionHash: event.transactionHash,
    transactionIndex: event.transactionIndex,
    logIndex: event.logIndex,
    contractAddress: event.contractAddress,
    eventName: event.eventName,
    topics: event.topics,
    data: event.data,
    observedAt: event.observedAt,
  };
}

export class MemoryRpcSource implements RpcSource {
  private hashes = new Map<number, string>();
  private receipts = new Map<string, { status: number; blockNumber: number }>();

  constructor(
    public readonly name: string,
    private latest = 0,
    private logs: SourceLog[] = [],
  ) {
    this.index(logs);
  }

  seed(logs: SourceLog[], latest?: number) {
    this.logs = [...logs];
    this.index(logs);
    if (latest !== undefined) this.latest = latest;
    else if (logs.length) {
      this.latest = Math.max(this.latest, ...logs.map(log => log.blockNumber));
    }
  }

  async getLatestBlock() {
    return this.latest;
  }

  async getBlockHash(blockNumber: number) {
    const hash = this.hashes.get(blockNumber);
    if (!hash) throw new ReadabilityError("TIMEOUT", `No block hash for ${blockNumber}`, true);
    return hash;
  }

  async getLogs(input: { fromBlock: number; toBlock: number; address: string; eventName: string }) {
    const address = input.address.toLowerCase();
    return this.logs.filter(log =>
      log.blockNumber >= input.fromBlock &&
      log.blockNumber <= input.toBlock &&
      log.contractAddress.toLowerCase() === address &&
      log.eventName === input.eventName,
    );
  }

  async getTransactionReceipt(txHash: string) {
    return this.receipts.get(txHash.toLowerCase()) ?? null;
  }

  private index(logs: SourceLog[]) {
    for (const log of logs) {
      this.hashes.set(log.blockNumber, log.blockHash);
      this.receipts.set(log.transactionHash.toLowerCase(), {
        status: 1,
        blockNumber: log.blockNumber,
      });
    }
  }
}

export class PreviewAttestationSource implements AttestationSource {
  constructor(private readonly rpc: RpcSource) {}

  async waitForAttestation(chainKey: number, blockNumber: number, _timeoutMs: number) {
    const sourceBlockHash = await this.rpc.getBlockHash(blockNumber);
    const now = new Date();
    return {
      chainKey,
      sourceBlock: blockNumber,
      sourceBlockHash,
      attestedAt: now.toISOString(),
      validUntil: new Date(now.getTime() + 60_000).toISOString(),
    };
  }
}

export class ProtocolProofSource implements ProofSource {
  constructor(
    private readonly builder: ProofBuilder,
    private readonly environment: ReadabilityEnvironment,
    private readonly minConfirmations: number,
  ) {}

  async build(input: { chainKey: number; blockNumber: number; transactionHash: string; event: SourceLog }) {
    if (this.builder.kind === "live") {
      throw new ReadabilityError(
        "LIVE_BOUNDARY",
        "The durable worker does not fabricate Proof Builder output. Live proofs go through verifyLiveAttestcoinProof.",
      );
    }
    const query = queryFromLog(input.event, this.environment, this.minConfirmations);
    return this.builder.build(query, sourceEventFromLog(input.event, input.blockNumber + this.minConfirmations + 8));
  }
}

export class ProtocolAscSource implements AscSource {
  private readonly receipts = new Map<string, { status: number; blockNumber: number }>();

  constructor(
    private readonly executor: AscExecutor,
    private readonly environment: ReadabilityEnvironment,
    private readonly minConfirmations: number,
  ) {}

  async submit(input: { queryId: string; event: SourceLog; proof: unknown; idempotencyKey: string }) {
    const proof = input.proof as ProofBundle;
    const query = queryFromLog(input.event, this.environment, this.minConfirmations);
    const event = sourceEventFromLog(input.event, input.event.blockNumber + this.minConfirmations + 8);
    const result = await this.executor.submit(query, event, proof);
    const receipt = { status: 1, blockNumber: input.event.blockNumber };
    this.receipts.set(result.transactionHash, receipt);
    this.receipts.set(input.idempotencyKey, receipt);
    return { transactionHash: result.transactionHash };
  }

  async getReceipt(txHash: string) {
    return this.receipts.get(txHash) ?? null;
  }
}

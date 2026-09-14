import type { TransactionResponse } from "ethers";
import type { AttestcoinSourceChainName } from "@shared/multichain";
import { AttestcoinError } from "../attestcoin/errors";
import { resolveSourceChain, type ResolvedSourceChain } from "./registry";
import { withSourceRpc } from "./rpc";
import {
  assertSourceFinality,
  confirmationCount,
  type SourceObservation,
} from "./finality";
import type { SourceObservationAdapter } from "./adapters";

export type SourceTransaction = {
  hash: string;
  blockNumber: number;
  from?: string;
  to?: string | null;
  chain: AttestcoinSourceChainName;
};

export interface SourceChainAdapter extends SourceObservationAdapter {
  getTransaction(txHash: string): Promise<SourceTransaction>;
}

export class EvmSourceChainAdapter implements SourceChainAdapter {
  readonly resolved: ResolvedSourceChain;

  constructor(readonly chain: AttestcoinSourceChainName) {
    this.resolved = resolveSourceChain(chain);
  }

  async getTransaction(txHash: string): Promise<SourceTransaction> {
    const tx = await withSourceRpc(this.chain, provider =>
      provider.getTransaction(txHash),
    );
    return this.normalizeTransaction(tx, txHash);
  }

  async getBlockNumber(): Promise<number> {
    return withSourceRpc(this.chain, provider => provider.getBlockNumber());
  }

  async observe(txHash: string): Promise<SourceObservation> {
    const tx = await this.getTransaction(txHash);
    const head = await this.getBlockNumber();
    const observation: SourceObservation = {
      hash: tx.hash,
      blockNumber: tx.blockNumber,
      head,
      confirmations: confirmationCount(head, tx.blockNumber),
      confirmationDepth: this.resolved.confirmationDepth,
      staleAfterBlocks: this.resolved.staleAfterBlocks,
      from: tx.from,
      to: tx.to,
      chain: this.chain,
    };
    assertSourceFinality(observation);
    return observation;
  }

  private normalizeTransaction(
    tx: TransactionResponse | null,
    txHash: string,
  ): SourceTransaction {
    if (!tx?.blockNumber) {
      throw new AttestcoinError(
        "SOURCE_RPC",
        "Source transaction has not been mined.",
        { retriable: true },
      );
    }
    return {
      hash: tx.hash ?? txHash,
      blockNumber: tx.blockNumber,
      from: tx.from,
      to: tx.to,
      chain: this.chain,
    };
  }
}

const adapters = new Map<AttestcoinSourceChainName, EvmSourceChainAdapter>();

export function getSourceChainAdapter(chain: AttestcoinSourceChainName) {
  const existing = adapters.get(chain);
  if (existing && existing.resolved.environment === resolveSourceChain(chain).environment) {
    return existing;
  }
  const created = new EvmSourceChainAdapter(chain);
  adapters.set(chain, created);
  return created;
}

export function resetSourceAdapters() {
  adapters.clear();
}

export function previewTemplateFor(chain: AttestcoinSourceChainName) {
  return resolveSourceChain(chain).preview;
}

import type { ProofBundle, ReadabilityQuery, SourceEvent } from "@shared/readability";
import { SUCCESS_RECEIPT_STATUS } from "@shared/attestcoin";
import { sha256 } from "./ids";
import type { ProofBuilder } from "./types";
import { resolveSourceChain } from "../multichain/registry";
import { MERKLE_HASHING } from "./merkle/hash";
import { buildPreviewLeaves, previewTreeIndex } from "./merkle/preview";
import { buildTransactionTree } from "./merkle/tree";

export class DeterministicProofBuilder implements ProofBuilder {
  readonly kind = "preview" as const;

  async build(query: ReadabilityQuery, event: SourceEvent): Promise<ProofBundle> {
    const resolved = resolveSourceChain(query.sourceChain, { environment: query.environment });
    const treeIndex = previewTreeIndex(event);
    const inclusion = buildTransactionTree(buildPreviewLeaves(event), treeIndex);
    return {
      adapter: "preview",
      chainKey: resolved.chainKey ?? 0,
      blockHeight: event.blockNumber,
      encodedTransaction: event.data,
      merkleProofPresent: true,
      continuityProofPresent: true,
      hashing: MERKLE_HASHING,
      merkleRoot: inclusion.merkleRoot,
      siblings: inclusion.siblings,
      leafCount: inclusion.leafCount,
      lowerEndpointDigest: `0x${sha256(`${event.blockHash}:lower`).padEnd(64, "0").slice(0, 64)}`,
      continuityRoots: [`0x${sha256(`${event.blockHash}:continuity`).padEnd(64, "0").slice(0, 64)}`],
      txIndex: inclusion.transactionIndex,
      receiptStatus: SUCCESS_RECEIPT_STATUS,
      proofRoot: inclusion.merkleRoot,
    };
  }
}

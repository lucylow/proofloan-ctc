import type { TransactionProverProvider } from "./provider";
import type {
  ContinuityProof,
  EncodedTransaction,
  MerkleProof,
  SourceBlock,
  TransactionTarget,
} from "./types";
import { encodedBytesFromHex, normalizeHex } from "./hash";

/**
 * Educational prover. Empty Merkle siblings mean the leaf is the root.
 * This is not Attestcoin consensus.
 */
export class DeterministicMockProver implements TransactionProverProvider {
  async getTransaction(target: TransactionTarget): Promise<EncodedTransaction> {
    const hex = "0x6001600055";
    return {
      hex,
      byteLength: encodedBytesFromHex(hex),
      txIndex: 0,
      blockNumber: 1_000n,
      txHash: target.txHash,
    };
  }

  async getBlock(chainKey: number, blockNumber: bigint): Promise<SourceBlock> {
    return {
      number: blockNumber,
      hash: `0xblock${chainKey}${blockNumber}`,
      parentHash: "0xparent",
      transactionCount: 1,
      attested: true,
    };
  }

  async getMerkleProof(target: TransactionTarget): Promise<MerkleProof> {
    const leaf = normalizeHex(target.txHash);
    return { root: leaf, siblings: [] };
  }

  async getContinuityProof(_chainKey: number, blockNumber: bigint): Promise<ContinuityProof> {
    return {
      lowerEndpointDigest: "lower",
      roots: [],
      startBlock: blockNumber,
      endBlock: blockNumber,
      hashCount: 0,
    };
  }

  async getAttestationBlock(_chainKey: number, blockNumber: bigint): Promise<bigint> {
    return blockNumber + 10n;
  }
}

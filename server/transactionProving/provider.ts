import type {
  ContinuityProof,
  EncodedTransaction,
  MerkleProof,
  SourceBlock,
  TransactionTarget,
} from "./types";

export interface TransactionProverProvider {
  getTransaction(target: TransactionTarget): Promise<EncodedTransaction>;
  getBlock(chainKey: number, blockNumber: bigint): Promise<SourceBlock>;
  getMerkleProof(target: TransactionTarget): Promise<MerkleProof>;
  getContinuityProof(chainKey: number, blockNumber: bigint): Promise<ContinuityProof>;
  getAttestationBlock(chainKey: number, blockNumber: bigint): Promise<bigint>;
}

export type ChainId = string;
export type ChainKey = number;
export type TxHash = string;
export type Address = string;

export interface VerifiedChainEvent {
  chainId: ChainId;
  chainKey?: ChainKey;
  blockNumber: number;
  blockHash: string;
  txHash: TxHash;
  txIndex: number;
  address: Address;
  topic0: string;
  data: string;
  timestampMs: number;
  proofRoot?: string;
  verified: boolean;
  freshnessMs?: number;
  evidenceId: string;
}

export interface BlockchainObservation {
  chainId: ChainId;
  address: Address;
  blockNumber: number;
  txHash: TxHash;
  direction: 'in' | 'out' | 'self';
  asset: string;
  amount: string;
  timestampMs: number;
  verified: boolean;
  evidenceId?: string;
}

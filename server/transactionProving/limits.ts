import { DEFAULT_MAX_CONTINUITY_HASHES, DEFAULT_MAX_MERKLE_SIBLINGS, DEFAULT_MAX_TX_BYTES } from "./constants";

export interface ResourceLimits {
  maxBytes: number;
  maxHashes: number;
  maxMerkleDepth: number;
}

export const DEFAULT_LIMITS: ResourceLimits = {
  maxBytes: DEFAULT_MAX_TX_BYTES,
  maxHashes: DEFAULT_MAX_CONTINUITY_HASHES,
  maxMerkleDepth: DEFAULT_MAX_MERKLE_SIBLINGS,
};

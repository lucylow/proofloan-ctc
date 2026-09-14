import { keccak256, solidityPacked } from "ethers";

/** Same 32-byte padding the USC SDK uses for missing right children. */
export const ZERO_HASH = "0x0000000000000000000000000000000000000000000000000000000000000000";

export const MERKLE_HASHING = "usc-keccak-domain-separated" as const;

/**
 * Domain-separated leaf hash matching `@gluwa/usc-sdk` / Block Prover:
 * `keccak256(abi.encodePacked(uint8(0x00), bytes))`.
 */
export function hashLeaf(leaf: string): string {
  return keccak256(solidityPacked(["uint8", "bytes"], [0x00, leaf]));
}

/**
 * Domain-separated inner hash matching `@gluwa/usc-sdk` / Block Prover:
 * `keccak256(abi.encodePacked(uint8(0x01), bytes32, bytes32))`.
 */
export function hashInner(left: string, right: string): string {
  return keccak256(solidityPacked(["uint8", "bytes32", "bytes32"], [0x01, left, right]));
}

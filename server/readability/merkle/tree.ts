import type { MerkleSibling } from "@shared/readability";
import { ReadabilityError } from "../errors";
import { hashInner, hashLeaf, ZERO_HASH } from "./hash";

export type BuiltMerkleProof = {
  merkleRoot: string;
  siblings: MerkleSibling[];
  leafCount: number;
  transactionIndex: number;
  depth: number;
};

/**
 * Compact keccak Merkle tree using the USC SDK layout: hash every payload as a
 * leaf, pad missing right children with ZERO_HASH, and emit an `isLeft` sibling
 * path (`left: true` means the sibling sits on the left of the running hash).
 */
export class KeccakMerkleTree {
  private readonly levels: string[][];

  constructor(items: string[]) {
    if (items.length === 0) {
      throw new ReadabilityError("PROOF", "Cannot build a Merkle tree from an empty transaction set.");
    }
    const levels: string[][] = [];
    let currentLevel = items.map(item => hashLeaf(item));
    let currentLen = currentLevel.length;

    while (currentLen > 0) {
      const nextLevel =
        currentLen > 1
          ? Array.from({ length: Math.ceil(currentLen / 2) }, (_, i) => {
              const left = currentLevel[i * 2];
              const right = currentLevel[i * 2 + 1] || ZERO_HASH;
              return hashInner(left, right);
            })
          : [];
      levels.push(currentLevel);
      currentLevel = nextLevel;
      currentLen = currentLevel.length;
    }

    this.levels = levels;
  }

  getRoot(): string {
    return this.levels[this.levels.length - 1]?.[0] ?? ZERO_HASH;
  }

  leafCount(): number {
    return this.levels[0]?.length ?? 0;
  }

  getProof(leafIndex: number): BuiltMerkleProof {
    const leafCount = this.leafCount();
    if (leafIndex < 0 || leafIndex >= leafCount) {
      throw new ReadabilityError("VALIDATION", `Merkle index ${leafIndex} is out of range. Max index: ${leafCount - 1}.`);
    }

    let currentIndex = leafIndex;
    const siblings: MerkleSibling[] = this.levels
      .slice()
      .reverse()
      .slice(1)
      .reverse()
      .map(level => {
        const siblingOffset = 1 - (currentIndex % 2);
        const siblingIndex = currentIndex + 2 * siblingOffset - 1;
        currentIndex = Math.floor(currentIndex / 2);
        return {
          hash: level[siblingIndex] || ZERO_HASH,
          left: siblingOffset === 0,
        };
      });

    return {
      merkleRoot: this.getRoot(),
      siblings,
      leafCount,
      transactionIndex: leafIndex,
      depth: siblings.length,
    };
  }
}

export function buildTransactionTree(encodedTransactions: string[], targetIndex: number): BuiltMerkleProof {
  return new KeccakMerkleTree(encodedTransactions).getProof(targetIndex);
}

import type { MockSourceBlock, MockTransaction } from "../types";
import { hex } from "../utils";

export function createMockSourceBlocks(seed: string, transactions: MockTransaction[]): MockSourceBlock[] {
  const seen = new Set<string>();
  const blocks: MockSourceBlock[] = [];

  for (const transaction of transactions) {
    const key = `${transaction.chainId}:${transaction.blockNumber}`;
    if (seen.has(key)) continue;
    seen.add(key);
    blocks.push({
      id: `blk_${key}`,
      chainId: transaction.chainId,
      blockNumber: transaction.blockNumber,
      blockHash: hex(`${seed}:block:${key}`, 32),
      timestamp: transaction.timestamp,
      attested: transaction.finalized,
      attestationRound: transaction.finalized ? 12 : 3,
      finalityLag: transaction.finalized ? 2 : 14,
    });
  }

  return blocks;
}

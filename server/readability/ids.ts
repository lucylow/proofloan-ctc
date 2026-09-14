import { createHash } from "node:crypto";
import type { EventCursor } from "./types";

export function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export function stableQueryId(input: unknown): string {
  return `rq_${sha256(JSON.stringify(input)).slice(0, 32)}`;
}

export function eventKey(
  chainId: string,
  blockNumber: number,
  txHash: string,
  logIndex: number,
): string {
  return `${chainId}:${blockNumber}:${txHash.toLowerCase()}:${logIndex}`;
}

export function cursorKey(cursor: EventCursor): string {
  return `${cursor.blockNumber}:${cursor.transactionIndex}:${cursor.logIndex}`;
}

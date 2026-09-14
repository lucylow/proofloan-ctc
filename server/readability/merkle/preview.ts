import type { SourceEvent } from "@shared/readability";
import { sha256 } from "../ids";

/**
 * Preview trees are local educational reconstructions. They are not the
 * attested source-block tree the live Proof Builder returns.
 */
export const PREVIEW_TREE_WIDTH = 8;

export function previewTreeIndex(event: SourceEvent, width = PREVIEW_TREE_WIDTH): number {
  return event.transactionIndex % width;
}

export function neighborEncodedTransaction(event: SourceEvent, slot: number): string {
  return `0x${sha256(`${event.blockHash}:${event.transactionHash}:${slot}`)}`;
}

export function buildPreviewLeaves(event: SourceEvent, width = PREVIEW_TREE_WIDTH): string[] {
  const index = previewTreeIndex(event, width);
  return Array.from({ length: width }, (_, slot) =>
    slot === index ? event.data : neighborEncodedTransaction(event, slot),
  );
}

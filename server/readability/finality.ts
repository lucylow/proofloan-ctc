import type { SourceEvent } from "@shared/readability";
import { ReadabilityError } from "./errors";

export type FinalityPolicy = {
  minConfirmations: number;
  reorgBuffer: number;
};

export function confirmationsFor(event: SourceEvent, latestBlock: number): number {
  if (!Number.isInteger(latestBlock) || latestBlock < event.blockNumber) return 0;
  return latestBlock - event.blockNumber + 1;
}

export function isMature(event: SourceEvent, latestBlock: number, policy: FinalityPolicy): boolean {
  return confirmationsFor(event, latestBlock) >= policy.minConfirmations + policy.reorgBuffer;
}

export function withUpdatedConfirmations(event: SourceEvent, latestBlock: number): SourceEvent {
  return { ...event, confirmations: confirmationsFor(event, latestBlock) };
}

export function assertFinal(event: SourceEvent, latestBlock: number, policy: FinalityPolicy): SourceEvent {
  const matured = withUpdatedConfirmations(event, latestBlock);
  if (!isMature(matured, latestBlock, policy)) {
    throw new ReadabilityError(
      "FINALITY",
      `Source event ${event.transactionHash} has ${matured.confirmations} confirmation(s); ${policy.minConfirmations + policy.reorgBuffer} are required before attestation.`,
      true,
    );
  }
  return matured;
}

import type { SourceLog } from "./types";
import { digestObject } from "./hash";

export function eventId(event: SourceLog): string {
  return digestObject({
    chainId: event.chainId,
    blockNumber: event.blockNumber,
    transactionHash: event.transactionHash,
    transactionIndex: event.transactionIndex,
    logIndex: event.logIndex,
    contractAddress: event.contractAddress.toLowerCase(),
    eventName: event.eventName,
  });
}

export function queryJobId(queryId: string, event: SourceLog): string {
  return digestObject({ queryId, eventId: eventId(event) });
}

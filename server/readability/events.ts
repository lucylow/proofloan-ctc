import type { SourceEvent } from "@shared/readability";
import type { EventCursor, SourceChainAdapter } from "./types";
import { eventKey } from "./ids";
import { compareEventOrder } from "./event-helpers";

export function compareCursors(a: EventCursor, b: EventCursor): number {
  if (a.blockNumber !== b.blockNumber) return a.blockNumber - b.blockNumber;
  if (a.transactionIndex !== b.transactionIndex) return a.transactionIndex - b.transactionIndex;
  return a.logIndex - b.logIndex;
}

export function eventCursor(event: SourceEvent): EventCursor {
  return {
    blockNumber: event.blockNumber,
    transactionIndex: event.transactionIndex,
    logIndex: event.logIndex,
  };
}

export function sortEvents(events: SourceEvent[]): SourceEvent[] {
  return events.slice().sort(compareEventOrder);
}

export class EventScanner {
  private cursor?: EventCursor;

  constructor(private readonly adapter: SourceChainAdapter) {}

  setCursor(cursor?: EventCursor): void {
    this.cursor = cursor;
  }

  getCursor(): EventCursor | undefined {
    return this.cursor;
  }

  async scan(args: {
    address: string;
    eventName: string;
    fromBlock: number;
    toBlock: number;
  }): Promise<SourceEvent[]> {
    const events = sortEvents(await this.adapter.getLogs(args));
    const filtered = this.cursor
      ? events.filter(event => compareCursors(eventCursor(event), this.cursor!) > 0)
      : events;
    if (filtered.length > 0) {
      this.cursor = eventCursor(filtered[filtered.length - 1]);
    }
    return filtered;
  }
}

export async function unprocessedEvents(
  store: { hasProcessedEvent(key: string): Promise<boolean> },
  events: SourceEvent[],
): Promise<SourceEvent[]> {
  const fresh: SourceEvent[] = [];
  for (const event of events) {
    const key = eventKey(event.chainId, event.blockNumber, event.transactionHash, event.logIndex);
    if (await store.hasProcessedEvent(key)) continue;
    fresh.push(event);
  }
  return fresh;
}

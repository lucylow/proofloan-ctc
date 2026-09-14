import type { DurableWorkerStore } from "./store";
import type { EventCursor } from "./types";

export class CursorManager {
  constructor(private readonly store: DurableWorkerStore, private readonly key: string) {}
  async get():Promise<EventCursor> { return (await this.store.getCursor(this.key)) ?? {blockNumber:0,transactionIndex:0,logIndex:-1}; }
  async advance(next:EventCursor):Promise<void> { const current=await this.get(); if(this.compare(next,current)<0) throw new Error("Cursor regression"); await this.store.putCursor(this.key,next); }
  compare(a:EventCursor,b:EventCursor){ if(a.blockNumber!==b.blockNumber)return a.blockNumber-b.blockNumber; if(a.transactionIndex!==b.transactionIndex)return a.transactionIndex-b.transactionIndex; return a.logIndex-b.logIndex; }
}

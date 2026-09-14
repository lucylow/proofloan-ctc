import type { DurableWorkerStore } from "./store";
import type { SourceLog } from "./types";
import { eventId } from "./event-id";

export class EventDeduplicator {
  constructor(private readonly store:DurableWorkerStore) {}
  async accept(event:SourceLog):Promise<{accepted:boolean;eventId:string}> {
    const id=eventId(event);
    if(await this.store.isEventProcessed(id))return {accepted:false,eventId:id};
    return {accepted:true,eventId:id};
  }
}

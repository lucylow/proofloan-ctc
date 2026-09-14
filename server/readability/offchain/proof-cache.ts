import { eventId } from "./event-id";
import type { SourceLog } from "./types";

export class ProofCache {
  private cache=new Map<string,{proof:unknown;expiresAt:number}>();
  constructor(private readonly ttlMs=5*60_000, private readonly clock=()=>Date.now()){}
  get(event:SourceLog){const k=eventId(event),v=this.cache.get(k); if(!v||v.expiresAt<=this.clock()){if(v)this.cache.delete(k);return null;} return v.proof;}
  set(event:SourceLog,proof:unknown){this.cache.set(eventId(event),{proof,expiresAt:this.clock()+this.ttlMs});}
  size(){return this.cache.size;}
}

import type { RpcSource, SourceLog } from "./types";
import { CircuitBreaker } from "./circuit-breaker";
import { WorkerError } from "./errors";

export type RpcCandidate = RpcSource & { breaker: CircuitBreaker; weight: number };

export class RpcPool {
  private readonly sources: RpcCandidate[];
  constructor(sources: RpcSource[], private readonly quorum = 1) {
    this.sources = sources.map((source, index) => ({
      name: source.name,
      getLatestBlock: () => source.getLatestBlock(),
      getBlockHash: (blockNumber: number) => source.getBlockHash(blockNumber),
      getLogs: (input: { fromBlock: number; toBlock: number; address: string; eventName: string }) => source.getLogs(input),
      getTransactionReceipt: (txHash: string) => source.getTransactionReceipt(txHash),
      breaker: new CircuitBreaker(),
      weight: sources.length - index,
    }));
    if (!this.sources.length) throw new WorkerError("CONFIG", "At least one RPC source is required", "permanent");
  }
  private available() { return this.sources.filter(s => s.breaker.canRequest()); }
  async getLatestBlock(): Promise<number> {
    const replies = await Promise.allSettled(this.available().map(async s => { try { const n = await s.getLatestBlock(); s.breaker.success(); return {n, source:s.name}; } catch(e) { s.breaker.failure(); throw e; }}));
    const values = replies.filter((r): r is PromiseFulfilledResult<{n:number;source:string}> => r.status === "fulfilled").map(r=>r.value.n).sort((a,b)=>b-a);
    if (values.length < this.quorum) throw new WorkerError("RPC_QUORUM", "RPC quorum unavailable", "transient");
    return values[Math.floor((values.length-1)/2)];
  }
  async getBlockHash(block: number): Promise<string> {
    const replies = await Promise.allSettled(this.available().map(async s => { try { const h=await s.getBlockHash(block); s.breaker.success(); return h; } catch(e){ s.breaker.failure(); throw e; }}));
    const counts = new Map<string,number>();
    for (const r of replies) if (r.status === "fulfilled") counts.set(r.value,(counts.get(r.value)??0)+1);
    const winner = [...counts.entries()].sort((a,b)=>b[1]-a[1])[0];
    if (!winner || winner[1] < this.quorum) throw new WorkerError("RPC_QUORUM", `No block hash quorum for ${block}`, "reorg");
    return winner[0];
  }
  async getLogs(input:{fromBlock:number;toBlock:number;address:string;eventName:string}):Promise<SourceLog[]> {
    const replies = await Promise.allSettled(this.available().map(async s => { try { const logs=await s.getLogs(input); s.breaker.success(); return logs; } catch(e){ s.breaker.failure(); throw e; }}));
    const byKey = new Map<string, SourceLog>();
    for (const r of replies) if (r.status === "fulfilled") for (const e of r.value) {
      const key=`${e.blockNumber}:${e.transactionHash}:${e.logIndex}`; if(!byKey.has(key)) byKey.set(key,e);
    }
    return [...byKey.values()].sort((a,b)=>a.blockNumber-b.blockNumber || a.transactionIndex-b.transactionIndex || a.logIndex-b.logIndex);
  }
  async receipt(txHash:string){
    for (const source of this.available()) {
      try { const r=await source.getTransactionReceipt(txHash); source.breaker.success(); if(r) return r; }
      catch { source.breaker.failure(); }
    }
    return null;
  }
  health(){ return this.sources.map(s=>({name:s.name,state:s.breaker.getState()})); }
}

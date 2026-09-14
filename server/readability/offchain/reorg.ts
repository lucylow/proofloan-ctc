import type { DurableWorkerStore } from "./store";
import type { RpcSource } from "./types";

export class ReorgGuard {
  constructor(private readonly store: DurableWorkerStore, private readonly key: string) {}
  async record(blockNumber:number, hash:string) { await this.store.putBlockHash(this.key, blockNumber, hash); }
  async verifyCanonical(source: RpcSource, blockNumber:number):Promise<boolean> {
    const expected = await this.store.getBlockHash(this.key, blockNumber);
    if (!expected) return true;
    const actual = await source.getBlockHash(blockNumber);
    return expected === actual;
  }
  async detectRange(source: RpcSource, fromBlock:number, toBlock:number):Promise<number[]> {
    const changed:number[]=[];
    for(let n=fromBlock;n<=toBlock;n++) if(!(await this.verifyCanonical(source,n))) changed.push(n);
    return changed;
  }
}

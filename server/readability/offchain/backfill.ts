import type { RpcPool } from "./rpc-pool";
import type { CursorManager } from "./cursor";
import type { SourceLog } from "./types";

export class BackfillScanner {
  constructor(private readonly rpc:RpcPool, private readonly cursor:CursorManager, private readonly maxRange:number) {}
  async scan(input:{address:string;eventName:string;latest:number;maxBlocks:number}):Promise<SourceLog[]> {
    const cursor=await this.cursor.get();
    const window=Math.max(1,Math.min(this.maxRange,input.maxBlocks));
    const start=cursor.blockNumber>0
      ? Math.min(input.latest, Math.max(0,cursor.blockNumber))
      : Math.max(0, input.latest-window+1);
    const end=Math.min(input.latest, Math.max(start, start+window-1));
    if(end<start)return [];
    return this.rpc.getLogs({fromBlock:start,toBlock:end,address:input.address,eventName:input.eventName});
  }
}

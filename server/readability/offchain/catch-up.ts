import type {RpcPool} from './rpc-pool';
import type {CursorManager} from './cursor';
import {ranges} from './event-range';
export class CatchUpPlanner{constructor(private readonly rpc:RpcPool,private readonly cursor:CursorManager,private readonly maxRange:number){}async plan(latest:number){const current=await this.cursor.get();return ranges(current.blockNumber,latest,this.maxRange).map(([fromBlock,toBlock])=>({fromBlock,toBlock}))}}

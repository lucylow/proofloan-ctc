import type {RpcPool} from './rpc-pool';
export class SourceMonitor{constructor(private readonly rpc:RpcPool){}async snapshot(){const latest=await this.rpc.getLatestBlock();return{latest,rpcs:this.rpc.health(),observedAt:new Date().toISOString()}}}

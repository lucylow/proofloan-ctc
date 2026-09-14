import type { RpcPool } from "./rpc-pool";
import type { WorkerMetrics } from "./metrics";
export class WorkerHealth {
  constructor(private readonly rpc:RpcPool,private readonly metrics:WorkerMetrics){}
  snapshot(){return {status:"ok" as const,rpc:this.rpc.health(),metrics:this.metrics.snapshot(),checkedAt:new Date().toISOString()};}
}

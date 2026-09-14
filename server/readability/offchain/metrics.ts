import type { WorkerMetricsSnapshot } from "./types";
export class WorkerMetrics {
  private data:WorkerMetricsSnapshot={discovered:0,deduplicated:0,matured:0,proofBuilt:0,submissions:0,confirmations:0,failures:0,retries:0,deadLetters:0,activeJobs:0,queueDepth:0,lagBlocks:0};
  inc(key:keyof WorkerMetricsSnapshot,n=1){const v=this.data[key];if(typeof v==='number')this.data[key]=v+n;}
  set(key:keyof WorkerMetricsSnapshot,value:number){this.data[key]=value;}
  snapshot(){return {...this.data};}
}

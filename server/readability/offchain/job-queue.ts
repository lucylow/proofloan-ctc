import type { DurableWorkerStore } from "./store";
import type { Logger, WorkerJob } from "./types";

export class JobQueue {
  constructor(private readonly store:DurableWorkerStore,private readonly logger:Logger){}
  async enqueue(job:WorkerJob){const current=await this.store.getJob(job.jobId);if(current)return current;await this.store.putJob(job);this.logger.info("readability job enqueued",{jobId:job.jobId});return job;}
  async lease(owner:string,nowMs:number,limit:number){const jobs=await this.store.listRunnableJobs(nowMs,limit);const leased:WorkerJob[]=[];for(const job of jobs){if(job.leaseExpiresAt&&Date.parse(job.leaseExpiresAt)>nowMs)continue;leased.push({...job,leaseOwner:owner});}return leased;}
}

import type { DurableWorkerStore } from "./store";
import type { Logger, WorkerConfig, WorkerJob } from "./types";
import { backoffDelay } from "./backoff";
import { classifyError, WorkerError } from "./errors";
import { AttestationWatcher } from "./attestation-watcher";
import { ProofCoordinator } from "./proof";
import { AscDelivery } from "./asc-delivery";
import { optimizeQuery } from "../gas/query-plan";
import { planningInputFromSource } from "../gas/from-source";

function gasAwareEnabled(config: WorkerConfig): boolean {
  return config.gasAware === true || process.env.ATTESTCOIN_GAS_AWARE === "true";
}

export type JobDependencies={store:DurableWorkerStore;attestation:AttestationWatcher;proofs:ProofCoordinator;delivery:AscDelivery;config:WorkerConfig;logger:Logger;loadEvent:(eventId:string)=>Promise<any>};
export class JobRunner{
  private active=0;
  constructor(private readonly deps:JobDependencies){}
  async tick(){
    const slots=this.deps.config.maxConcurrentJobs-this.active;
    if(slots<=0)return;
    const jobs=await this.deps.store.listRunnableJobs(Date.now(),slots);
    await Promise.all(jobs.map(job=>this.run(job)));
  }
  private async run(job:WorkerJob){this.active+=1;try{await this.execute(job);}finally{this.active-=1;}}
  private async execute(job:WorkerJob){const {store,config,logger}=this.deps;const event=await this.deps.loadEvent(job.eventId);try{
    await store.putJob({...job,phase:"discovered",attempts:job.attempts+1,updatedAt:new Date().toISOString()});
    await this.deps.attestation.wait(event,event.chainKey??0,config.attestationTimeoutMs);
    await store.putJob({...job,phase:"matured",updatedAt:new Date().toISOString()});
    if (gasAwareEnabled(config)) {
      const attestedHead = event.blockNumber + Math.max(event.confirmations ?? 1, 1) - 1;
      const decision = optimizeQuery(planningInputFromSource({
        eventBlock: event.blockNumber,
        attestedBlock: attestedHead,
        encodedTransactionHex: event.data ?? "0x",
      }));
      if (decision.action === "reject" || decision.action === "manual-review") {
        throw new WorkerError("GAS", `Gas policy ${decision.action}: ${decision.reasons.join("; ") || decision.risk}`, "permanent");
      }
      if (decision.action === "wait") {
        throw new WorkerError("GAS_WAIT", `Gas policy deferred continuity length ${decision.continuityHashCount}`, "transient");
      }
    }
    const proof=await this.deps.proofs.build(event,event.chainKey??0,config.proofTimeoutMs);
    await store.putJob({...job,phase:"proof-ready",updatedAt:new Date().toISOString()});
    const submitted=await this.deps.delivery.submit({queryId:job.queryId,event,proof});
    await store.putJob({...job,phase:"submitted",updatedAt:new Date().toISOString()});
    await this.deps.delivery.waitForReceipt(submitted.transactionHash,config.submissionTimeoutMs);
    await store.putJob({...job,phase:"confirmed",updatedAt:new Date().toISOString()});
    await store.markEventProcessed(job.eventId);
  }catch(error){
    const normalized=classifyError(error); const attempts=job.attempts+1;
    if(attempts>=config.maxAttempts||!normalized.retryable){await store.putJob({...job,phase:"dead-letter",attempts,updatedAt:new Date().toISOString(),lastError:normalized.message});await store.putDeadLetter({...job,phase:"dead-letter",attempts,updatedAt:new Date().toISOString(),lastError:normalized.message},normalized.code);logger.error("job moved to dead letter",{jobId:job.jobId,code:normalized.code});return;}
    const delay=backoffDelay(attempts,{baseMs:1000,maxMs:120_000,jitterRatio:0.25},normalized.retryClass);
    await store.putJob({...job,attempts,phase:job.phase,nextAttemptAt:new Date(Date.now()+delay).toISOString(),updatedAt:new Date().toISOString(),lastError:normalized.message});
  }}
}

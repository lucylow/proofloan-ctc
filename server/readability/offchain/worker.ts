import type { DurableWorkerStore } from "./store";
import type { AttestationSource, AscSource, Logger, ProofSource, RpcSource, SourceLog, WorkerConfig } from "./types";
import { RpcPool } from "./rpc-pool";
import { CursorManager } from "./cursor";
import { BackfillScanner } from "./backfill";
import { EventDeduplicator } from "./dedupe";
import { queryJobId } from "./event-id";
import { JobQueue } from "./job-queue";
import { WorkerMetrics } from "./metrics";
import { WorkerAudit } from "./audit";
import { AttestationWatcher } from "./attestation-watcher";
import { ProofCoordinator } from "./proof";
import { AscDelivery } from "./asc-delivery";
import { JobRunner } from "./job-runner";
import { PollScheduler } from "./scheduler";
import { consoleLogger } from "./logger";

export type WorkerDeps={store:DurableWorkerStore;rpcSources:RpcSource[];attestation:AttestationSource;proofs:ProofSource;asc:AscSource;config:WorkerConfig;logger?:Logger};
export class ProductionReadabilityWorker {
  readonly metrics=new WorkerMetrics();
  readonly audit=new WorkerAudit();
  readonly rpc:RpcPool;
  private readonly cursor:CursorManager;
  private readonly scanner:BackfillScanner;
  private readonly dedupe:EventDeduplicator;
  private readonly queue:JobQueue;
  readonly runner:JobRunner;
  private readonly scheduler:PollScheduler;
  private started=false;
  constructor(private readonly deps:WorkerDeps){
    const logger=deps.logger??consoleLogger;this.rpc=new RpcPool(deps.rpcSources,deps.config.rpcQuorum);this.cursor=new CursorManager(deps.store,`readability:${deps.config.environment}`);this.scanner=new BackfillScanner(this.rpc,this.cursor,deps.config.maxLogRange);this.dedupe=new EventDeduplicator(deps.store);this.queue=new JobQueue(deps.store,logger);
    this.runner=new JobRunner({store:deps.store,config:deps.config,logger,attestation:new AttestationWatcher(deps.attestation),proofs:new ProofCoordinator(deps.proofs),delivery:new AscDelivery(deps.asc),loadEvent:async id=>{const e=await deps.store.getEvent(id);if(!e)throw new Error(`event ${id} not found`);return e;}});
    this.scheduler=new PollScheduler(deps.config,this.runner,logger);
  }
  start(){if(this.started)return;this.started=true;this.scheduler.start();}
  stop(){if(!this.started)return;this.scheduler.stop();this.started=false;}
  async tick(){await this.runner.tick();}
  async discover(queryId:string,input:{address:string;eventName:string}){
    const latest=await this.rpc.getLatestBlock();
    const events=await this.scanner.scan({address:input.address,eventName:input.eventName,latest,maxBlocks:this.deps.config.maxLogRange});
    return this.ingest(queryId,events,latest);
  }
  async ingest(queryId:string,events:SourceLog[],latest=0){
    this.metrics.inc("discovered",events.length);
    let acceptedCount=0;
    for(const event of events){const accepted=await this.dedupe.accept(event);if(!accepted.accepted){this.metrics.inc("deduplicated");continue;}const indexed={...event,eventId:accepted.eventId,confirmations:Math.max(0,latest-event.blockNumber),sourceCheckpoint:event.blockHash};await this.deps.store.putEvent(indexed);const job={jobId:queryJobId(queryId,event),queryId,eventId:accepted.eventId,attempts:0,phase:"created" as const,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),nextAttemptAt:new Date().toISOString()};await this.queue.enqueue(job);this.audit.append("event-discovered",{jobId:job.jobId,eventId:accepted.eventId,meta:{queryId}});acceptedCount+=1;}
    if(events.length){const last=events[events.length-1];await this.cursor.advance({blockNumber:last.blockNumber,transactionIndex:last.transactionIndex,logIndex:last.logIndex});}
    this.metrics.set("queueDepth",(await this.deps.store.listRunnableJobs(Date.now(),this.deps.config.batchSize)).length);
    return {latest,events:events.length,accepted:acceptedCount};
  }
  health(){return {started:this.started,metrics:this.metrics.snapshot(),rpc:this.rpc.health(),audits:this.audit.list().slice(-10)};}
}

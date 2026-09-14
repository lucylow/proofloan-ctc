import { WorkerError } from "./errors";
import type { AscSource, SourceLog } from "./types";

export class AscDelivery {
  constructor(private readonly asc:AscSource){}
  async submit(input:{queryId:string;event:SourceLog;proof:unknown}){
    const idempotencyKey=`${input.queryId}:${input.event.transactionHash}:${input.event.logIndex}`;
    try{return await this.asc.submit({...input,idempotencyKey});}
    catch(e){throw new WorkerError("ASC_SUBMIT_FAILED",e instanceof Error?e.message:String(e),"transient",{idempotencyKey});}
  }
  async waitForReceipt(txHash:string,timeoutMs:number,intervalMs=3000){
    const start=Date.now();
    while(Date.now()-start<timeoutMs){const r=await this.asc.getReceipt(txHash);if(r)return r;await new Promise(r=>setTimeout(r,intervalMs));}
    throw new WorkerError("ASC_RECEIPT_TIMEOUT",`No ASC receipt for ${txHash}`,"transient");
  }
}

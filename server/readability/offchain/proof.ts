import { WorkerError } from "./errors";
import type { ProofSource, SourceLog } from "./types";

export class ProofCoordinator {
  constructor(private readonly source:ProofSource) {}
  async build(event:SourceLog, chainKey:number, timeoutMs:number){
    const controller=new AbortController(); const timer=setTimeout(()=>controller.abort(),timeoutMs);
    try { const proof=await this.source.build({chainKey,blockNumber:event.blockNumber,transactionHash:event.transactionHash,event}); if(!proof) throw new WorkerError("EMPTY_PROOF","Proof builder returned no proof","transient"); return proof; }
    catch(e){ if((e as Error).name==="AbortError") throw new WorkerError("PROOF_TIMEOUT","Proof generation timed out","transient"); throw e; }
    finally { clearTimeout(timer); }
  }
}

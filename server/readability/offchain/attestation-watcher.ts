import { WorkerError } from "./errors";
import type { AttestationSource, SourceLog } from "./types";

export class AttestationWatcher {
  constructor(private readonly source:AttestationSource, private readonly sleep=(ms:number)=>new Promise<void>(r=>setTimeout(r,ms)), private readonly intervalMs=3000) {}
  async wait(event:SourceLog, chainKey:number, timeoutMs:number) {
    const started=Date.now();
    while(Date.now()-started<timeoutMs){
      try { const a=await this.source.waitForAttestation(chainKey,event.blockNumber,Math.max(1000,timeoutMs-(Date.now()-started))); if(a.sourceBlock!==event.blockNumber) throw new WorkerError("ATTESTATION_MISMATCH","Attestation block mismatch","attestation"); if(a.sourceBlockHash.toLowerCase()!==event.blockHash.toLowerCase()) throw new WorkerError("ATTESTATION_HASH_MISMATCH","Attestation block hash mismatch","attestation"); return a; }
      catch(e){ if(e instanceof WorkerError && (e.code==="ATTESTATION_MISMATCH" || e.code==="ATTESTATION_HASH_MISMATCH")) throw e; await this.sleep(Math.min(this.intervalMs,timeoutMs-(Date.now()-started))); }
    }
    throw new WorkerError("ATTESTATION_TIMEOUT","Attestation timeout","attestation");
  }
}

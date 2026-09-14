import type { Logger } from "./types";
import { classifyError } from "./errors";

export class WorkerSupervisor {
  private running=false;
  private promise?:Promise<void>;
  constructor(private readonly logger:Logger,private readonly loop:(signal:AbortSignal)=>Promise<void>,private readonly sleep=(ms:number)=>new Promise<void>(r=>setTimeout(r,ms))){ }
  start(){if(this.running)return;this.running=true;const controller=new AbortController();this.abortController=controller;this.promise=this.run(controller.signal);}
  private abortController?:AbortController;
  async stop(){if(!this.running)return;this.running=false;this.abortController?.abort();await this.promise;}
  private async run(signal:AbortSignal){while(this.running&&!signal.aborted){try{await this.loop(signal);}catch(e){const n=classifyError(e);this.logger.error("worker loop failure",{code:n.code,message:n.message});await this.sleep(1000);}}}
}

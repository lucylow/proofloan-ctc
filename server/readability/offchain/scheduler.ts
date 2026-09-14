import type { Logger, WorkerConfig } from "./types";
import { JobRunner } from "./job-runner";

export class PollScheduler {
  private timer?:ReturnType<typeof setInterval>;
  private running=false;
  constructor(private readonly config:WorkerConfig,private readonly runner:JobRunner,private readonly logger:Logger){}
  start(){if(this.running)return;this.running=true;this.timer=setInterval(()=>this.tick().catch(e=>this.logger.error("scheduler tick failed",{error:String(e)})),this.config.pollIntervalMs);void this.tick();}
  stop(){if(this.timer)clearInterval(this.timer);this.timer=undefined;this.running=false;}
  private async tick(){if(!this.running)return;await this.runner.tick();}
}

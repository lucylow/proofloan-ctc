export type LivenessSample = { at:number; head:number; attested:number; healthy:boolean };
export type LivenessState = { lagBlocks:number; lagSeconds:number; healthy:boolean; samples:number; lastHealthyAt?:string };

export class AttestorLivenessTracker {
  private samples:LivenessSample[]=[];
  record(sample:LivenessSample):void { this.samples.push(sample); if(this.samples.length>300) this.samples.shift(); }
  snapshot(now=Date.now()):LivenessState {
    const latest=this.samples.at(-1); if(!latest) return {lagBlocks:0,lagSeconds:0,healthy:false,samples:0};
    const lagBlocks=Math.max(0,latest.head-latest.attested); const last=this.samples.filter(x=>x.healthy).at(-1);
    const lagSeconds=last?Math.max(0,Math.floor((now-last.at)/1000)):0;
    return {lagBlocks,lagSeconds,healthy:latest.healthy,samples:this.samples.length,lastHealthyAt:last?new Date(last.at).toISOString():undefined};
  }
}
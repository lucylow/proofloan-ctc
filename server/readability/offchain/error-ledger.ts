export type ErrorRecord={jobId:string;code:string;message:string;attempt:number;time:string};
export class ErrorLedger{private rows:ErrorRecord[]=[];record(r:ErrorRecord){this.rows.push(r)}forJob(jobId:string){return this.rows.filter(x=>x.jobId===jobId)}latest(jobId:string){return this.forJob(jobId).at(-1)}}

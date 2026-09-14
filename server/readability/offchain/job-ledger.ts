import type {WorkerJob} from './types';
export class JobLedger{private map=new Map<string,WorkerJob>();put(j:WorkerJob){this.map.set(j.jobId,{...j})}get(id:string){return this.map.get(id)}all(){return [...this.map.values()]}}

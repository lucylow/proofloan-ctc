import type {WorkerJob} from './types';
export type DeadLetterEntry={jobId:string;eventId:string;reason:string;failedAt:string;attempts:number};
export class DeadLetterQueue{private entries:DeadLetterEntry[]=[];add(job:WorkerJob,reason:string){const e={jobId:job.jobId,eventId:job.eventId,reason,failedAt:new Date().toISOString(),attempts:job.attempts};this.entries.push(e);return e}list(){return [...this.entries]}find(jobId:string){return this.entries.find(e=>e.jobId===jobId)}}

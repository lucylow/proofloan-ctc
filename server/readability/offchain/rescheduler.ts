import type {WorkerJob} from './types';
export function reschedule(job:WorkerJob,delayMs:number):WorkerJob{return{...job,nextAttemptAt:new Date(Date.now()+delayMs).toISOString(),updatedAt:new Date().toISOString()}}

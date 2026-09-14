import type {WorkerJob} from './types';export function jobAgeMs(job:WorkerJob,now=Date.now()){return Math.max(0,now-Date.parse(job.createdAt))}

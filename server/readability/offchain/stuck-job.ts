import type {WorkerJob} from './types';export function isStuck(job:WorkerJob,now=Date.now(),thresholdMs=10*60_000){return job.phase!=='confirmed'&&now-Date.parse(job.updatedAt)>thresholdMs}

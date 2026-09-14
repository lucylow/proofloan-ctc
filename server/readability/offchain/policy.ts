export type WorkerPolicy={maxAttempts:number;maxBatchSize:number;maxLogRange:number;minConfirmations:number;reorgBuffer:number};
export const safePolicy:WorkerPolicy={maxAttempts:8,maxBatchSize:50,maxLogRange:2000,minConfirmations:12,reorgBuffer:2};
export function validatePolicy(p:WorkerPolicy){for(const [k,v] of Object.entries(p)){if(typeof v!=='number'||v<1)throw new Error(`invalid policy ${k}`)}return p}
export function mergePolicy(base:WorkerPolicy,overrides:Partial<WorkerPolicy>){return validatePolicy({...base,...overrides})}

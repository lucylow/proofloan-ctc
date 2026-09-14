import type {WorkerConfig} from './types';
export function validateWorkerConfig(c:WorkerConfig){if(c.maxAttempts<1)throw new Error('maxAttempts must be positive');if(c.rpcQuorum<1)throw new Error('rpcQuorum must be positive');if(c.maxConcurrentJobs<1)throw new Error('maxConcurrentJobs must be positive');if(c.maxLogRange<1)throw new Error('maxLogRange must be positive');return c}

import type {EventCursor,WorkerJob,WorkerMetricsSnapshot} from './types';
export type WorkerSnapshot={capturedAt:string,cursor:EventCursor|undefined,jobs:WorkerJob[],metrics:WorkerMetricsSnapshot};
export function makeSnapshot(input:Omit<WorkerSnapshot,'capturedAt'>):WorkerSnapshot{return{...input,capturedAt:new Date().toISOString()}}

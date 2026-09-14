import type {SourceLog} from './types';
export function compareEvents(a:SourceLog,b:SourceLog){return a.blockNumber-b.blockNumber||a.transactionIndex-b.transactionIndex||a.logIndex-b.logIndex}
export function sortEvents(events:SourceLog[]){return [...events].sort(compareEvents)}

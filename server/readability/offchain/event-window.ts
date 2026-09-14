import type {SourceLog} from './types';
export function filterWindow(events:SourceLog[],from:number,to:number){return events.filter(e=>e.blockNumber>=from&&e.blockNumber<=to)}

import type {SourceLog} from './types';
export function missingFields(e:SourceLog){const missing:string[]=[];for(const [k,v] of Object.entries(e)){if(v===undefined||v===null||v==='')missing.push(k)}return missing}
export function assertComplete(e:SourceLog){const missing=missingFields(e);if(missing.length)throw new Error(`incomplete event: ${missing.join(',')}`);return true}

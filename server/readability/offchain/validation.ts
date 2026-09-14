import type {SourceLog} from './types';
export function validateEvent(e:SourceLog){if(!e.transactionHash||!e.blockHash)throw new Error('event hashes required');if(e.logIndex<0||e.transactionIndex<0||e.blockNumber<0)throw new Error('event indices must be non-negative');return true}

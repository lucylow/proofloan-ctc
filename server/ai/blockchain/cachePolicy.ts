export interface CachePolicy { ttlMs:number; maxEntries:number; }
export function isFresh(createdAt:number,ttlMs:number,now=Date.now()){ return now-createdAt<=ttlMs; }

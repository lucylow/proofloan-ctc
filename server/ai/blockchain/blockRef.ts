export interface BlockRef { chainId:string; number:number; hash:string; timestampMs?:number; }
export function blockRefKey(b:BlockRef){ return `${b.chainId}:${b.number}:${b.hash.toLowerCase()}`; }

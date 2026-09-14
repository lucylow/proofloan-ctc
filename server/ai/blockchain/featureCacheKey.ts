export function featureCacheKey(address:string,chains:string[],asOfBlock?:number){ return `bc-ai:${address.toLowerCase()}:${[...chains].sort().join(',')}:${asOfBlock??'latest'}`; }

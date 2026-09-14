export interface BlockchainFeatureSnapshot { id:string; createdAt:number; features:Record<string,number>; sourceHashes:string[]; }
export function createSnapshot(id:string,features:Record<string,number>,sourceHashes:string[]):BlockchainFeatureSnapshot{ return {id,createdAt:Date.now(),features,sourceHashes}; }

export type Checkpoint={block:number;hash:string;capturedAt:string};
export function checkpoint(block:number,hash:string):Checkpoint{return{block,hash,capturedAt:new Date().toISOString()}}

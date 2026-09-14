export function participationBps(cast:bigint,total:bigint):number{return total===0n?0:Number(cast*10000n/total);}

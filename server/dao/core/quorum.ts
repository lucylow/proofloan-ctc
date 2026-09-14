export function quorum(total:bigint,participating:bigint,bps:number):boolean{return total>0n && participating*10000n>=total*BigInt(bps);}

export function validateDelegationCap(power:bigint,total:bigint,capBps=3000):boolean{return total===0n?false:power*10000n<=total*BigInt(capBps);}

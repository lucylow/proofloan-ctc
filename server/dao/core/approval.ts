export function approval(forVotes:bigint,againstVotes:bigint,bps:number):boolean{const d=forVotes+againstVotes;return d>0n&&forVotes*10000n>=d*BigInt(bps);}

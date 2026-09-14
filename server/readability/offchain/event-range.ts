export function ranges(from:number,to:number,max:number){const out:Array<[number,number]>=[];for(let s=from;s<=to;s+=max)out.push([s,Math.min(to,s+max-1)]);return out}

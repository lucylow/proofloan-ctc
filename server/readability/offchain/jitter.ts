export function boundedJitter(base:number,ratio:number){const span=Math.max(0,base*ratio);return Math.max(0,base-span/2+Math.random()*span)}
export function decorrelatedJitter(previous:number,base:number,max:number){return Math.min(max,Math.max(base,Math.random()*(previous*3-base)+base))}

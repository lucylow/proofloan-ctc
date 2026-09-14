export interface Exposure { asset:string; value:number; chainId:string; }
export function concentration(exposures:Exposure[]){ if(!exposures.length)return 0; const total=exposures.reduce((a,e)=>a+Math.max(0,e.value),0); if(!total)return 0; const max=Math.max(...exposures.map(e=>e.value)); return max/total; }

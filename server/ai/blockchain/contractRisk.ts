export function contractRisk(unknownProtocols:number,totalProtocols:number){ if(totalProtocols<=0)return 0; return Math.max(0,Math.min(1,unknownProtocols/totalProtocols)); }

export type NodeScore={name:string;latencyMs:number;failures:number;successes:number;score:number};
export function scoreNode(input:Omit<NodeScore,'score'>):NodeScore{const total=input.successes+input.failures;const successRate=total===0?1:input.successes/total;const latencyPenalty=Math.min(1,input.latencyMs/5000);return{...input,score:Math.max(0,successRate*(1-latencyPenalty))}}

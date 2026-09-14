
export type InvariantResult={name:string;ok:boolean;reason?:string};
export function invariant06(input:{block:number;cursor:number;attempts:number;processed:boolean}):InvariantResult{
  if(input.block<0)return{name:'invariant-06',ok:false,reason:'negative block'};
  if(input.cursor<0)return{name:'invariant-06',ok:false,reason:'negative cursor'};
  if(input.attempts<0)return{name:'invariant-06',ok:false,reason:'negative attempts'};
  if(input.processed&&input.attempts===0)return{name:'invariant-06',ok:false,reason:'processed without attempt'};
  return{name:'invariant-06',ok:true};
}
export function assertInvariant06(input:Parameters<typeof invariant06>[0]){const r=invariant06(input);if(!r.ok)throw new Error(r.reason);return r}

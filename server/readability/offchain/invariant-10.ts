
export type InvariantResult={name:string;ok:boolean;reason?:string};
export function invariant10(input:{block:number;cursor:number;attempts:number;processed:boolean}):InvariantResult{
  if(input.block<0)return{name:'invariant-10',ok:false,reason:'negative block'};
  if(input.cursor<0)return{name:'invariant-10',ok:false,reason:'negative cursor'};
  if(input.attempts<0)return{name:'invariant-10',ok:false,reason:'negative attempts'};
  if(input.processed&&input.attempts===0)return{name:'invariant-10',ok:false,reason:'processed without attempt'};
  return{name:'invariant-10',ok:true};
}
export function assertInvariant10(input:Parameters<typeof invariant10>[0]){const r=invariant10(input);if(!r.ok)throw new Error(r.reason);return r}
